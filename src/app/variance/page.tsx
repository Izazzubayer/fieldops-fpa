"use client";

import { useMemo, useState } from "react";
import { FilterBar, defaultFilterState, type FilterState } from "@/components/FilterBar";
import { PageHeader, Panel } from "@/components/ui";
import { VarianceBarChart } from "@/components/Charts";
import { VarianceTable } from "@/components/VarianceTable";
import { getDashboardBundle } from "@/lib/metrics";

export default function VariancePage() {
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);
  const data = useMemo(() => getDashboardBundle(filters), [filters]);
  const basisLabel =
    filters.basis === "budget"
      ? "budget"
      : filters.basis === "forecast"
        ? "forecast"
        : "prior year";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Core interview demo"
        title="Variance Lab"
        description={`Actual vs ${basisLabel} with drill-down into volume, rate, mix, and cost drivers — the same workflow as a Power BI variance matrix plus DAX, built here in TypeScript for transparency.`}
      />

      <FilterBar value={filters} onChange={setFilters} />

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="By region">
          <VarianceBarChart
            data={data.varianceByRegion.map((r) => ({
              label: r.label,
              variance: r.variance,
            }))}
          />
        </Panel>
        <Panel title="By service line">
          <VarianceBarChart
            data={data.varianceByService.map((r) => ({
              label: r.label,
              variance: r.variance,
            }))}
          />
        </Panel>
      </div>

      <Panel title={`Region × service — click a row for drivers (vs ${basisLabel})`}>
        <VarianceTable rows={data.detailedVariance} />
      </Panel>
    </div>
  );
}
