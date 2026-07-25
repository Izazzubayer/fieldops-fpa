"use client";

import { REGIONS, SERVICE_LINES, periods, latestPeriod } from "@/data/seed";
import type { CompareBasis, PeriodMode, Region, ServiceLine } from "@/data/types";

export interface FilterState {
  period: string;
  mode: PeriodMode;
  basis: CompareBasis;
  region: Region | "All";
  serviceLine: ServiceLine | "All";
}

export const defaultFilterState = (): FilterState => ({
  period: latestPeriod,
  mode: "YTD",
  basis: "budget",
  region: "All",
  serviceLine: "All",
});

const selectClass =
  "rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30";

export function FilterBar({
  value,
  onChange,
  showBasis = true,
}: {
  value: FilterState;
  onChange: (next: FilterState) => void;
  showBasis?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 sm:p-4 shadow-[0_1px_0_rgba(18,38,28,0.04)]">
      <label className="flex flex-col gap-1 text-[11px] uppercase tracking-wider text-[var(--muted)]">
        As of
        <select
          className={selectClass}
          value={value.period}
          onChange={(e) => onChange({ ...value, period: e.target.value })}
        >
          {[...periods].reverse().map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-[11px] uppercase tracking-wider text-[var(--muted)]">
        Scope
        <select
          className={selectClass}
          value={value.mode}
          onChange={(e) => onChange({ ...value, mode: e.target.value as PeriodMode })}
        >
          <option value="MTD">MTD</option>
          <option value="QTD">QTD</option>
          <option value="YTD">YTD</option>
        </select>
      </label>
      {showBasis && (
        <label className="flex flex-col gap-1 text-[11px] uppercase tracking-wider text-[var(--muted)]">
          Compare to
          <select
            className={selectClass}
            value={value.basis}
            onChange={(e) => onChange({ ...value, basis: e.target.value as CompareBasis })}
          >
            <option value="budget">Budget</option>
            <option value="forecast">Forecast</option>
            <option value="priorYear">Prior year</option>
          </select>
        </label>
      )}
      <label className="flex flex-col gap-1 text-[11px] uppercase tracking-wider text-[var(--muted)]">
        Region
        <select
          className={selectClass}
          value={value.region}
          onChange={(e) =>
            onChange({ ...value, region: e.target.value as Region | "All" })
          }
        >
          <option value="All">All regions</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-[11px] uppercase tracking-wider text-[var(--muted)]">
        Service line
        <select
          className={selectClass}
          value={value.serviceLine}
          onChange={(e) =>
            onChange({
              ...value,
              serviceLine: e.target.value as ServiceLine | "All",
            })
          }
        >
          <option value="All">All services</option>
          {SERVICE_LINES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
