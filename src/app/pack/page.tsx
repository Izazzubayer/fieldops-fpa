"use client";

import { useMemo, useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import { FilterBar, defaultFilterState, type FilterState } from "@/components/FilterBar";
import { PageHeader, Panel } from "@/components/ui";
import { buildNarrative } from "@/lib/ai";
import { getDashboardBundle } from "@/lib/metrics";
import { formatCurrency, formatPct, periodLabel } from "@/lib/format";

export default function PackPage() {
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);
  const narrative = useMemo(() => buildNarrative(filters), [filters]);
  const data = useMemo(() => getDashboardBundle(filters), [filters]);
  const [copied, setCopied] = useState(false);

  async function copyPack() {
    await navigator.clipboard.writeText(narrative.fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadPack() {
    const blob = new Blob([narrative.fullText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fieldops-fpa-brief-${filters.period}-${filters.mode}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const basisLabel =
    filters.basis === "budget"
      ? "Budget"
      : filters.basis === "forecast"
        ? "Forecast"
        : "Prior year";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reporting automation"
        title="Monthly Pack"
        description="Build a management-ready briefing in one click. Copy or download for email, Slack, or your monthly business review deck."
      />

      <FilterBar value={filters} onChange={setFilters} />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyPack}
          className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--ink)] hover:border-[var(--accent)] transition-colors"
        >
          {copied ? <Check size={16} className="text-[var(--positive)]" /> : <Copy size={16} />}
          {copied ? "Copied" : "Copy brief"}
        </button>
        <button
          type="button"
          onClick={downloadPack}
          className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
        >
          <Download size={16} />
          Download .md
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_0.9fr] gap-4">
        <Panel title={`${periodLabel(filters.period)} · ${filters.mode} management brief`}>
          <article className="prose-pack space-y-4 text-sm">
            <p className="text-base font-medium text-[var(--ink)]">{narrative.headline}</p>
            <div>
              <h4 className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
                Snapshot vs {basisLabel}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  ["Revenue", data.pnl.revenue.actual],
                  ["Gross profit", data.pnl.grossProfit.actual],
                  ["EBITDA", data.pnl.ebitda.actual],
                  ["Utilization", null],
                ].map(([label, val]) => (
                  <div
                    key={String(label)}
                    className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                      {label}
                    </p>
                    <p className="font-[family-name:var(--font-mono)] text-sm tabular-nums mt-0.5">
                      {val === null
                        ? `${data.ops.utilizationPct}%`
                        : formatCurrency(val as number, { compact: true })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
                Key points
              </h4>
              <ul className="space-y-1.5 text-[var(--ink-soft)]">
                {narrative.bullets.map((b) => (
                  <li key={b}>• {b}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
                Risks
              </h4>
              <ul className="space-y-1.5 text-[var(--ink-soft)]">
                {narrative.risks.map((r) => (
                  <li key={r}>• {r}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
                Recommended actions
              </h4>
              <ul className="space-y-1.5 text-[var(--ink-soft)]">
                {narrative.actions.map((a) => (
                  <li key={a}>• {a}</li>
                ))}
              </ul>
            </div>
          </article>
        </Panel>

        <Panel title="Top variances for the appendix">
          <ul className="space-y-2">
            {data.detailedVariance.slice(0, 8).map((row) => (
              <li
                key={row.id}
                className="flex justify-between gap-2 text-sm border-b border-[var(--border)] pb-2 last:border-0"
              >
                <span className="text-[var(--ink-soft)]">{row.label}</span>
                <span
                  className={`font-[family-name:var(--font-mono)] tabular-nums shrink-0 ${
                    row.variance >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"
                  }`}
                >
                  {formatCurrency(row.variance, { compact: true, signed: true })}{" "}
                  <span className="text-[var(--muted)]">({formatPct(row.variancePct)})</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
