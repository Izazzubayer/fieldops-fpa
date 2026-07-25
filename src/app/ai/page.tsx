"use client";

import { useMemo, useState } from "react";
import { Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { FilterBar, defaultFilterState, type FilterState } from "@/components/FilterBar";
import { PageHeader, Panel } from "@/components/ui";
import { buildNarrative } from "@/lib/ai";

const SUGGESTIONS = [
  "Why is revenue off budget?",
  "What's going on with Prairies Drilling?",
  "How is field utilization?",
  "Walk me through EBITDA and margin",
  "What does backlog say about cash?",
  "What should I put on the leadership agenda?",
];

type AnalyzeResponse = {
  ok: boolean;
  source: "huggingface" | "deterministic";
  model: string | null;
  content: string;
  note?: string;
  error?: string;
};

export default function AiPage() {
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);
  const seed = useMemo(() => buildNarrative(filters), [filters]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [brief, setBrief] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ source: string; model: string | null; note?: string } | null>(
    null,
  );
  const [loading, setLoading] = useState<"brief" | "ask" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAnalyze(mode: "brief" | "ask", q?: string) {
    setLoading(mode);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          question: q,
          period: filters.period,
          scope: filters.mode,
          basis: filters.basis,
          region: filters.region,
          serviceLine: filters.serviceLine,
        }),
      });
      const data = (await res.json()) as AnalyzeResponse;
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Analyze request failed");
      }
      setMeta({ source: data.source, model: data.model, note: data.note });
      if (mode === "brief") setBrief(data.content);
      else setAnswer(data.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(null);
    }
  }

  function ask(q: string) {
    setQuestion(q);
    void runAnalyze("ask", q);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI & finance transformation · Hugging Face"
        title="AI Analyst"
        description="Open-model FP&A analyst via Hugging Face Inference. The metrics engine builds a fact pack; the model may only narrate those numbers — the same pattern you'd use with Copilot over a governed Power BI semantic model."
      />

      <FilterBar value={filters} onChange={setFilters} />

      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1">
          <ShieldCheck size={13} className="text-[var(--accent)]" />
          Grounded on metrics fact pack
        </span>
        {meta && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1">
            <Sparkles size={13} className="text-[var(--accent)]" />
            {meta.source === "huggingface"
              ? `Hugging Face · ${meta.model ?? "model"}`
              : "Deterministic fallback"}
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel
          title="AI monthly brief"
          action={
            <button
              type="button"
              onClick={() => void runAnalyze("brief")}
              disabled={loading !== null}
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
            >
              {loading === "brief" ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Sparkles size={13} />
              )}
              Generate with HF
            </button>
          }
        >
          {brief ? (
            <pre className="whitespace-pre-wrap font-[family-name:var(--font-body)] text-sm text-[var(--ink-soft)] leading-relaxed">
              {brief}
            </pre>
          ) : (
            <>
              <p className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
                Seed narrative (deterministic) — click Generate for Hugging Face rewrite
              </p>
              <p className="text-base font-medium text-[var(--ink)] leading-snug">
                {seed.headline}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--ink-soft)]">
                {seed.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="text-[var(--accent)] mt-1.5 shrink-0">▸</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Panel>

        <Panel title="Ask the analyst">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (question.trim()) ask(question.trim());
            }}
          >
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Why is Pacific CPT ahead?"
              className="flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
            />
            <button
              type="submit"
              disabled={loading !== null}
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
            >
              {loading === "ask" ? <Loader2 size={14} className="animate-spin" /> : null}
              Ask
            </button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                disabled={loading !== null}
                onClick={() => ask(s)}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
          {answer && (
            <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--ink-soft)] leading-relaxed animate-fade-in whitespace-pre-wrap">
              {answer}
            </div>
          )}
          {error && <p className="mt-3 text-sm text-[var(--negative)]">{error}</p>}
          {meta?.note && (
            <p className="mt-3 text-[11px] text-[var(--muted)] leading-relaxed">{meta.note}</p>
          )}
          <p className="mt-4 text-[11px] text-[var(--muted)] leading-relaxed">
            Interview angle: AI drafts the pack; humans validate drivers. Same architecture as
            Microsoft Copilot / Power BI Copilot over trusted finance data — here via Hugging Face
            open models for a transparent, open-source portfolio story.
          </p>
        </Panel>
      </div>
    </div>
  );
}
