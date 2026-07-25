import type { Filters } from "@/lib/metrics";
import { getDashboardBundle } from "@/lib/metrics";
import { formatCurrency, periodLabel } from "@/lib/format";
import { buildNarrative } from "@/lib/ai";

export const HF_MODEL =
  process.env.HF_MODEL ?? "Qwen/Qwen2.5-7B-Instruct:fastest";

/** Compact, citation-ready fact pack — the model may only use these numbers. */
export function buildFactPack(filters: Filters) {
  const bundle = getDashboardBundle(filters);
  const basis = filters.basis ?? "budget";
  const basisLabel =
    basis === "budget" ? "budget" : basis === "forecast" ? "forecast" : "prior year";
  const deterministic = buildNarrative(filters);

  return {
    company: "FieldOps Geotechnics (fictional demo)",
    asOf: filters.period,
    asOfLabel: periodLabel(filters.period),
    scope: filters.mode,
    compareTo: basisLabel,
    region: filters.region ?? "All",
    serviceLine: filters.serviceLine ?? "All",
    pnl: {
      revenueActual: bundle.pnl.revenue.actual,
      revenueCompare: bundle.pnl.revenue[basis],
      revenueVariance: bundle.pnl.revenue.actual - bundle.pnl.revenue[basis],
      revenueVariancePct:
        bundle.pnl.revenue[basis] === 0
          ? 0
          : ((bundle.pnl.revenue.actual - bundle.pnl.revenue[basis]) /
              bundle.pnl.revenue[basis]) *
            100,
      grossProfit: bundle.pnl.grossProfit.actual,
      grossMarginPct: bundle.pnl.grossMarginPct,
      ebitda: bundle.pnl.ebitda.actual,
      ebitdaCompare: bundle.pnl.ebitda[basis],
      ebitdaVariance: bundle.pnl.ebitda.actual - bundle.pnl.ebitda[basis],
      ebitdaMarginPct: bundle.pnl.ebitdaMarginPct,
    },
    ops: {
      utilizationPct: bundle.ops.utilizationPct,
      billableDays: bundle.ops.billableDays,
      availableDays: bundle.ops.availableDays,
      equipmentIdleHours: bundle.ops.equipmentIdleHours,
      backlogRevenue: bundle.ops.backlogRevenue,
      avgDayRate: bundle.ops.avgDayRate,
      projectsActive: bundle.ops.projectsActive,
    },
    topVariances: bundle.detailedVariance.slice(0, 8).map((v) => ({
      segment: v.label,
      actual: v.actual,
      compare: v.compare,
      variance: v.variance,
      variancePct: v.variancePct,
      drivers: v.drivers.map((d) => ({
        label: d.label,
        impact: d.impact,
        note: d.note,
      })),
    })),
    formattedHints: {
      revenue: formatCurrency(bundle.pnl.revenue.actual, { compact: true }),
      revenueVar: formatCurrency(bundle.pnl.revenue.actual - bundle.pnl.revenue[basis], {
        compact: true,
        signed: true,
      }),
      ebitda: formatCurrency(bundle.pnl.ebitda.actual, { compact: true }),
      utilization: `${bundle.ops.utilizationPct}%`,
      headlineSeed: deterministic.headline,
    },
  };
}

export function systemPrompt(): string {
  return `You are a Junior FP&A analyst for a multi-entity geotechnical / field-services company.
You write concise management commentary for finance leadership.

HARD RULES:
- Use ONLY numbers and facts from the provided FACT PACK. Never invent, estimate, or round to a different figure.
- Prefer CAD-style compact currency when quoting (e.g. $1.2M) matching the fact pack.
- Lead with the decision-relevant story: what moved, why (volume/rate/mix/cost), what to do next.
- Tie ops metrics (utilization, idle hours, backlog) to financial outcomes when relevant.
- Tone: professional, direct, no hype, no emojis.
- If the question cannot be answered from the fact pack, say what is missing rather than guessing.
- This is a demo dataset; do not claim affiliation with any real employer.`;
}

export function briefUserPrompt(factPack: ReturnType<typeof buildFactPack>): string {
  return `Write a monthly FP&A AI brief for ${factPack.asOfLabel} (${factPack.scope}) vs ${factPack.compareTo}.

Return Markdown with exactly these sections:
## Headline
(one sentence)

## What moved
(3-5 bullets; cite segments and $ variances)

## Ops → finance
(2-3 bullets linking utilization / idle / backlog to P&L or cash)

## Risks
(2-3 bullets)

## Recommended actions
(3 concrete next steps for FP&A / ops)

FACT PACK (JSON):
${JSON.stringify(factPack, null, 2)}`;
}

export function askUserPrompt(
  factPack: ReturnType<typeof buildFactPack>,
  question: string,
): string {
  return `Answer this FP&A question using only the FACT PACK.

Question: ${question}

Respond in 1 short paragraph + up to 3 bullets. Cite specific segments and dollar variances from the pack.

FACT PACK (JSON):
${JSON.stringify(factPack, null, 2)}`;
}

export async function callHuggingFaceChat(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  opts: { maxTokens?: number } = {},
): Promise<{ content: string; model: string }> {
  const token = process.env.HF_TOKEN;
  if (!token) {
    throw new Error("HF_TOKEN is not configured");
  }

  const res = await fetch("https://router.huggingface.co/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: HF_MODEL,
      messages,
      max_tokens: opts.maxTokens ?? 900,
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Hugging Face error ${res.status}: ${text.slice(0, 400)}`);
  }

  const data = (await res.json()) as {
    model?: string;
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Empty response from Hugging Face");
  }
  return { content, model: data.model ?? HF_MODEL };
}
