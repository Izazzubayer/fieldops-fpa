"use client";

import { useMemo, useState } from "react";
import { FilterBar, defaultFilterState, type FilterState } from "@/components/FilterBar";
import { PageHeader, Panel } from "@/components/ui";
import { answerQuestion, buildNarrative } from "@/lib/ai";

const SUGGESTIONS = [
  "Why is revenue off budget?",
  "What's going on with Prairies Drilling?",
  "How is field utilization?",
  "Walk me through EBITDA and margin",
  "What does backlog say about cash?",
];

export default function AiPage() {
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);
  const narrative = useMemo(() => buildNarrative(filters), [filters]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);

  function ask(q: string) {
    setQuestion(q);
    setAnswer(answerQuestion(q, filters));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI & finance transformation"
        title="AI Analyst"
        description="Rule-based FP&A analyst grounded in the same metrics engine as the dashboards — demonstrates practical AI for variance narratives without requiring an API key. In production: Microsoft Copilot, Power BI Copilot, or a RAG layer over your semantic model."
      />

      <FilterBar value={filters} onChange={setFilters} />

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Auto-generated monthly narrative">
          <p className="text-base font-medium text-[var(--ink)] leading-snug">
            {narrative.headline}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[var(--ink-soft)]">
            {narrative.bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="text-[var(--accent)] mt-1.5 shrink-0">▸</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 pt-4 border-t border-[var(--border)]">
            <p className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
              Risks
            </p>
            <ul className="space-y-1.5 text-sm text-[var(--ink-soft)]">
              {narrative.risks.map((r) => (
                <li key={r}>• {r}</li>
              ))}
            </ul>
          </div>
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
              className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Ask
            </button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => ask(s)}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
          {answer && (
            <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--ink-soft)] leading-relaxed animate-fade-in">
              {answer}
            </div>
          )}
          <p className="mt-4 text-[11px] text-[var(--muted)] leading-relaxed">
            Demo mode uses deterministic analysis over the seed dataset (always works offline).
            Swap in an LLM with tool-calling against these metrics for a production Copilot-style
            experience — same prompts, live ERP facts.
          </p>
        </Panel>
      </div>
    </div>
  );
}
