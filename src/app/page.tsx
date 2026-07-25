"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FilterBar, defaultFilterState, type FilterState } from "@/components/FilterBar";
import { KpiCard, PageHeader, Panel } from "@/components/ui";
import { EbitdaBridgeChart, RevenueTrendChart } from "@/components/Charts";
import { getDashboardBundle } from "@/lib/metrics";
import { formatCurrency, formatPct, varianceTone } from "@/lib/format";
import { COMPANY } from "@/data/seed";

export default function OverviewPage() {
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);
  const data = useMemo(() => getDashboardBundle(filters), [filters]);

  const revVar = data.pnl.revenue.actual - data.pnl.revenue[filters.basis];
  const ebitdaVar = data.pnl.ebitda.actual - data.pnl.ebitda[filters.basis];
  const basisLabel =
    filters.basis === "budget"
      ? "budget"
      : filters.basis === "forecast"
        ? "forecast"
        : "prior year";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow={`${COMPANY.name} · As of ${COMPANY.asOf}`}
        title="Executive Overview"
        description="Multi-entity revenue, margin, and EBITDA for FieldOps Geotechnics — track performance against budget, forecast, and prior year."
      />

      <FilterBar value={filters} onChange={setFilters} />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          label="Revenue"
          value={formatCurrency(data.pnl.revenue.actual, { compact: true })}
          delta={formatCurrency(revVar, { compact: true, signed: true })}
          deltaLabel={`vs ${basisLabel}`}
          tone={varianceTone(revVar)}
        />
        <KpiCard
          label="Gross margin"
          value={`${data.pnl.grossMarginPct.toFixed(1)}%`}
          hint={`GP ${formatCurrency(data.pnl.grossProfit.actual, { compact: true })}`}
        />
        <KpiCard
          label="EBITDA"
          value={formatCurrency(data.pnl.ebitda.actual, { compact: true })}
          delta={formatCurrency(ebitdaVar, { compact: true, signed: true })}
          deltaLabel={`vs ${basisLabel}`}
          tone={varianceTone(ebitdaVar)}
        />
        <KpiCard
          label="Field utilization"
          value={`${data.ops.utilizationPct}%`}
          hint={`${data.ops.billableDays} billable days`}
          tone={data.ops.utilizationPct >= 75 ? "up" : data.ops.utilizationPct < 65 ? "down" : "flat"}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Revenue: actual vs budget / forecast (12 mo)">
          <RevenueTrendChart data={data.trend} />
        </Panel>
        <Panel title={`EBITDA bridge vs ${basisLabel}`}>
          <EbitdaBridgeChart steps={data.ebitdaBridge} />
        </Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel
          title="Where variance lives"
          action={
            <Link
              href="/variance"
              className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
            >
              Open Variance Lab <ArrowRight size={12} />
            </Link>
          }
        >
          <ul className="space-y-2">
            {data.detailedVariance.slice(0, 5).map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-3 text-sm border-b border-[var(--border)] last:border-0 pb-2 last:pb-0"
              >
                <span className="text-[var(--ink)]">{row.label}</span>
                <span
                  className={`font-[family-name:var(--font-mono)] tabular-nums ${
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
        <Panel title="Watchlist">
          <ol className="space-y-3 text-sm text-[var(--ink-soft)] list-decimal list-inside leading-relaxed">
            <li>
              <strong className="text-[var(--ink)]">Variance focus:</strong> Prairies Drilling
              weather drag vs Pacific CPT corridor upside — diagnose volume before cost.
            </li>
            <li>
              <strong className="text-[var(--ink)]">Ops linkage:</strong> utilization and idle
              hours are leading indicators for margin and cash timing.
            </li>
            <li>
              <strong className="text-[var(--ink)]">Next action:</strong> draft the monthly pack
              in AI Analyst, then validate drivers with region leads before close.
            </li>
          </ol>
        </Panel>
      </div>

    </div>
  );
}
