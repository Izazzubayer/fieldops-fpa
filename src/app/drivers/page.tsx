"use client";

import { useMemo, useState } from "react";
import { FilterBar, defaultFilterState, type FilterState } from "@/components/FilterBar";
import { KpiCard, PageHeader, Panel } from "@/components/ui";
import { UtilizationChart } from "@/components/Charts";
import { getDashboardBundle } from "@/lib/metrics";
import { formatCurrency, formatNumber } from "@/lib/format";
import { ops } from "@/data/seed";

export default function DriversPage() {
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);
  const data = useMemo(() => getDashboardBundle(filters), [filters]);

  const heatmap = useMemo(() => {
    const scoped = ops.filter((r) => {
      if (r.period !== filters.period) return false;
      if (filters.region !== "All" && r.region !== filters.region) return false;
      if (filters.serviceLine !== "All" && r.serviceLine !== filters.serviceLine)
        return false;
      return true;
    });
    return scoped.sort((a, b) => a.utilizationPct - b.utilizationPct);
  }, [filters]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ops → finance linkage"
        title="Ops Drivers"
        description="Field utilization, backlog, and equipment idle time as leading indicators for revenue variance, margin, and working capital — how FP&A partners with operations."
      />

      <FilterBar value={filters} onChange={setFilters} showBasis={false} />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          label="Utilization"
          value={`${data.ops.utilizationPct}%`}
          tone={data.ops.utilizationPct >= 75 ? "up" : data.ops.utilizationPct < 65 ? "down" : "flat"}
          hint="Target band ~75–85%"
        />
        <KpiCard
          label="Billable / available days"
          value={`${formatNumber(data.ops.billableDays)} / ${formatNumber(data.ops.availableDays)}`}
        />
        <KpiCard
          label="Equipment idle hours"
          value={formatNumber(data.ops.equipmentIdleHours)}
          tone={data.ops.equipmentIdleHours > 2000 ? "down" : "flat"}
          hint="Cash & margin tell"
        />
        <KpiCard
          label="Backlog"
          value={formatCurrency(data.ops.backlogRevenue, { compact: true })}
          hint={`Avg day rate ~$${formatNumber(data.ops.avgDayRate)}`}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Utilization trend (12 mo)">
          <UtilizationChart data={data.trend} />
        </Panel>
        <Panel title={`Utilization heatmap — ${filters.period} (low → high)`}>
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {heatmap.map((r) => {
              const pct = r.utilizationPct;
              const color =
                pct < 60
                  ? "bg-[var(--negative)]"
                  : pct < 75
                    ? "bg-[var(--warn)]"
                    : "bg-[var(--positive)]";
              return (
                <div key={`${r.region}-${r.serviceLine}`} className="flex items-center gap-3 text-xs">
                  <span className="w-36 sm:w-44 shrink-0 text-[var(--ink-soft)] truncate">
                    {r.region} · {r.serviceLine}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color} transition-all duration-500`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-[family-name:var(--font-mono)] tabular-nums">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <Panel title="How to talk about this in the interview">
        <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
          FP&A does not stop at the P&amp;L. For a geotech / site-investigation business, crew
          utilization and remobilization drive both revenue recognition and cost variance.
          Idle hours foreshadow working-capital strain; backlog quality foreshadows forecast
          confidence. In production you would model this in Power BI with relationships from
          ERP project actuals to a date table — same grain as this demo dataset.
        </p>
      </Panel>
    </div>
  );
}
