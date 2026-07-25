import { financials, ops, latestPeriod } from "@/data/seed";
import type {
  CompareBasis,
  FinancialRow,
  OpsRow,
  PeriodMode,
  Region,
  ServiceLine,
  VarianceDriver,
} from "@/data/types";

export interface Filters {
  period: string;
  mode: PeriodMode;
  region?: Region | "All";
  serviceLine?: ServiceLine | "All";
  basis?: CompareBasis;
}

function periodInScope(period: string, asOf: string, mode: PeriodMode): boolean {
  if (mode === "MTD") return period === asOf;
  const [ay, am] = asOf.split("-").map(Number);
  const [py, pm] = period.split("-").map(Number);
  if (mode === "QTD") {
    const aQ = Math.floor((am - 1) / 3);
    const pQ = Math.floor((pm - 1) / 3);
    return py === ay && pQ === aQ && pm <= am;
  }
  // YTD
  return py === ay && pm <= am;
}

function filterFinancials(f: Filters): FinancialRow[] {
  return financials.filter((r) => {
    if (!periodInScope(r.period, f.period, f.mode)) return false;
    if (f.region && f.region !== "All" && r.region !== f.region) return false;
    if (f.serviceLine && f.serviceLine !== "All" && r.serviceLine !== f.serviceLine)
      return false;
    return true;
  });
}

function filterOps(f: Filters): OpsRow[] {
  return ops.filter((r) => {
    if (!periodInScope(r.period, f.period, f.mode)) return false;
    if (f.region && f.region !== "All" && r.region !== f.region) return false;
    if (f.serviceLine && f.serviceLine !== "All" && r.serviceLine !== f.serviceLine)
      return false;
    return true;
  });
}

function sum(rows: FinancialRow[], key: keyof FinancialRow): number {
  return rows.reduce((acc, r) => acc + (r[key] as number), 0);
}

export interface PnlSnapshot {
  revenue: { actual: number; budget: number; forecast: number; priorYear: number };
  cogs: { actual: number; budget: number; forecast: number; priorYear: number };
  grossProfit: { actual: number; budget: number; forecast: number; priorYear: number };
  opex: { actual: number; budget: number; forecast: number; priorYear: number };
  ebitda: { actual: number; budget: number; forecast: number; priorYear: number };
  grossMarginPct: number;
  ebitdaMarginPct: number;
}

export function getPnl(filters: Filters): PnlSnapshot {
  const rows = filterFinancials(filters);
  const revenue = {
    actual: sum(rows, "actualRevenue"),
    budget: sum(rows, "budgetRevenue"),
    forecast: sum(rows, "forecastRevenue"),
    priorYear: sum(rows, "priorYearRevenue"),
  };
  const cogs = {
    actual: sum(rows, "actualCogs"),
    budget: sum(rows, "budgetCogs"),
    forecast: sum(rows, "forecastCogs"),
    priorYear: sum(rows, "priorYearCogs"),
  };
  const opex = {
    actual: sum(rows, "actualOpex"),
    budget: sum(rows, "budgetOpex"),
    forecast: sum(rows, "forecastOpex"),
    priorYear: sum(rows, "priorYearOpex"),
  };
  const grossProfit = {
    actual: revenue.actual - cogs.actual,
    budget: revenue.budget - cogs.budget,
    forecast: revenue.forecast - cogs.forecast,
    priorYear: revenue.priorYear - cogs.priorYear,
  };
  const ebitda = {
    actual: grossProfit.actual - opex.actual,
    budget: grossProfit.budget - opex.budget,
    forecast: grossProfit.forecast - opex.forecast,
    priorYear: grossProfit.priorYear - opex.priorYear,
  };

  return {
    revenue,
    cogs,
    grossProfit,
    opex,
    ebitda,
    grossMarginPct: revenue.actual ? (grossProfit.actual / revenue.actual) * 100 : 0,
    ebitdaMarginPct: revenue.actual ? (ebitda.actual / revenue.actual) * 100 : 0,
  };
}

export interface VarianceLine {
  id: string;
  label: string;
  region?: Region;
  serviceLine?: ServiceLine;
  actual: number;
  compare: number;
  variance: number;
  variancePct: number;
  drivers: VarianceDriver[];
}

function compareValue(
  row: FinancialRow,
  metric: "revenue" | "cogs" | "opex",
  basis: CompareBasis,
): { actual: number; compare: number } {
  if (metric === "revenue") {
    return {
      actual: row.actualRevenue,
      compare:
        basis === "budget"
          ? row.budgetRevenue
          : basis === "forecast"
            ? row.forecastRevenue
            : row.priorYearRevenue,
    };
  }
  if (metric === "cogs") {
    return {
      actual: row.actualCogs,
      compare:
        basis === "budget"
          ? row.budgetCogs
          : basis === "forecast"
            ? row.forecastCogs
            : row.priorYearCogs,
    };
  }
  return {
    actual: row.actualOpex,
    compare:
      basis === "budget"
        ? row.budgetOpex
        : basis === "forecast"
          ? row.forecastOpex
          : row.priorYearOpex,
  };
}

function buildDrivers(
  row: FinancialRow,
  basis: CompareBasis,
  opsRow?: OpsRow,
): VarianceDriver[] {
  const { actual, compare } = compareValue(row, "revenue", basis);
  const revVar = actual - compare;
  const drivers: VarianceDriver[] = [];

  if (opsRow) {
    const utilGap = opsRow.utilizationPct - 75;
    const volumeImpact = Math.round(revVar * (Math.abs(utilGap) > 5 ? 0.55 : 0.35));
    const rateImpact = Math.round(revVar * 0.25);
    const mixImpact = revVar - volumeImpact - rateImpact;

    drivers.push({
      code: "volume",
      label: "Volume / utilization",
      impact: volumeImpact,
      note:
        utilGap < -8
          ? `Utilization at ${opsRow.utilizationPct}% dragged billable days below plan.`
          : utilGap > 8
            ? `Strong utilization (${opsRow.utilizationPct}%) lifted volume vs ${basis}.`
            : `Volume largely in line; utilization ${opsRow.utilizationPct}%.`,
    });
    drivers.push({
      code: "rate",
      label: "Rate / pricing",
      impact: rateImpact,
      note: `Avg day rate ~$${opsRow.avgDayRate.toLocaleString("en-CA")}.`,
    });
    drivers.push({
      code: "mix",
      label: "Mix / timing",
      impact: mixImpact,
      note:
        Math.abs(mixImpact) > Math.abs(volumeImpact)
          ? "Project mix or timing shifted the remainder of the variance."
          : "Residual mix/timing after volume and rate.",
    });
  } else {
    drivers.push({
      code: "volume",
      label: "Volume",
      impact: Math.round(revVar * 0.6),
      note: "Estimated volume contribution.",
    });
    drivers.push({
      code: "rate",
      label: "Rate",
      impact: Math.round(revVar * 0.4),
      note: "Estimated rate contribution.",
    });
  }

  const cogs = compareValue(row, "cogs", basis);
  const cogsVar = cogs.actual - cogs.compare;
  if (Math.abs(cogsVar) > 5000) {
    drivers.push({
      code: "cost",
      label: "COGS / mobilization",
      impact: -cogsVar,
      note:
        cogsVar > 0
          ? "Cost pressure (fuel, remobilization, or overtime) widened the gap."
          : "Favorable cost run-rate vs plan.",
    });
  }

  return drivers;
}

export function getVarianceByDimension(
  filters: Filters,
  dimension: "region" | "serviceLine",
): VarianceLine[] {
  const basis = filters.basis ?? "budget";
  const rows = filterFinancials(filters);
  const opsRows = filterOps(filters);
  const groups = new Map<string, FinancialRow[]>();

  for (const r of rows) {
    const key = dimension === "region" ? r.region : r.serviceLine;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  const lines: VarianceLine[] = [];
  for (const [key, group] of groups) {
    const actual = group.reduce((a, r) => a + r.actualRevenue, 0);
    const compare = group.reduce((a, r) => {
      const v = compareValue(r, "revenue", basis).compare;
      return a + v;
    }, 0);
    const variance = actual - compare;
    const variancePct = compare ? (variance / compare) * 100 : 0;

    // Drivers from largest absolute row in group
    const top = [...group].sort(
      (a, b) =>
        Math.abs(compareValue(b, "revenue", basis).actual - compareValue(b, "revenue", basis).compare) -
        Math.abs(compareValue(a, "revenue", basis).actual - compareValue(a, "revenue", basis).compare),
    )[0];
    const opsMatch = opsRows.find(
      (o) =>
        o.period === top.period &&
        o.region === top.region &&
        o.serviceLine === top.serviceLine,
    );

    lines.push({
      id: key,
      label: key,
      region: dimension === "region" ? (key as Region) : undefined,
      serviceLine: dimension === "serviceLine" ? (key as ServiceLine) : undefined,
      actual,
      compare,
      variance,
      variancePct,
      drivers: buildDrivers(top, basis, opsMatch),
    });
  }

  return lines.sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));
}

export function getDetailedVariance(filters: Filters): VarianceLine[] {
  const basis = filters.basis ?? "budget";
  const rows = filterFinancials(filters);
  const opsRows = filterOps(filters);

  // Aggregate to region × service for the selected scope
  const map = new Map<string, FinancialRow>();
  for (const r of rows) {
    const key = `${r.region}|${r.serviceLine}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...r });
    } else {
      existing.actualRevenue += r.actualRevenue;
      existing.budgetRevenue += r.budgetRevenue;
      existing.forecastRevenue += r.forecastRevenue;
      existing.priorYearRevenue += r.priorYearRevenue;
      existing.actualCogs += r.actualCogs;
      existing.budgetCogs += r.budgetCogs;
      existing.forecastCogs += r.forecastCogs;
      existing.priorYearCogs += r.priorYearCogs;
      existing.actualOpex += r.actualOpex;
      existing.budgetOpex += r.budgetOpex;
      existing.forecastOpex += r.forecastOpex;
      existing.priorYearOpex += r.priorYearOpex;
    }
  }

  const lines: VarianceLine[] = [];
  for (const [key, r] of map) {
    const { actual, compare } = compareValue(r, "revenue", basis);
    const variance = actual - compare;
    const opsMatch = opsRows.find(
      (o) => o.region === r.region && o.serviceLine === r.serviceLine,
    );
    // Prefer latest period ops within scope for driver notes
    const latestOps =
      opsRows
        .filter((o) => o.region === r.region && o.serviceLine === r.serviceLine)
        .sort((a, b) => b.period.localeCompare(a.period))[0] ?? opsMatch;

    lines.push({
      id: key,
      label: `${r.region} · ${r.serviceLine}`,
      region: r.region,
      serviceLine: r.serviceLine,
      actual,
      compare,
      variance,
      variancePct: compare ? (variance / compare) * 100 : 0,
      drivers: buildDrivers(r, basis, latestOps),
    });
  }

  return lines.sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));
}

export interface TrendPoint {
  period: string;
  actual: number;
  budget: number;
  forecast: number;
  priorYear: number;
  utilizationPct: number;
}

export function getTrend(filters: Omit<Filters, "mode"> & { months?: number }): TrendPoint[] {
  const months = filters.months ?? 12;
  const [ay, am] = filters.period.split("-").map(Number);
  const points: TrendPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(ay, am - 1 - i, 1);
    const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const f: Filters = {
      period,
      mode: "MTD",
      region: filters.region,
      serviceLine: filters.serviceLine,
    };
    const pnl = getPnl(f);
    const o = filterOps(f);
    const util =
      o.length === 0
        ? 0
        : o.reduce((a, r) => a + r.utilizationPct, 0) / o.length;
    points.push({
      period,
      actual: pnl.revenue.actual,
      budget: pnl.revenue.budget,
      forecast: pnl.revenue.forecast,
      priorYear: pnl.revenue.priorYear,
      utilizationPct: Math.round(util * 10) / 10,
    });
  }
  return points;
}

export interface OpsKpis {
  utilizationPct: number;
  billableDays: number;
  availableDays: number;
  projectsActive: number;
  equipmentIdleHours: number;
  backlogRevenue: number;
  avgDayRate: number;
}

export function getOpsKpis(filters: Filters): OpsKpis {
  const rows = filterOps(filters);
  if (rows.length === 0) {
    return {
      utilizationPct: 0,
      billableDays: 0,
      availableDays: 0,
      projectsActive: 0,
      equipmentIdleHours: 0,
      backlogRevenue: 0,
      avgDayRate: 0,
    };
  }
  const billableDays = rows.reduce((a, r) => a + r.billableDays, 0);
  const availableDays = rows.reduce((a, r) => a + r.availableDays, 0);
  return {
    utilizationPct: availableDays ? Math.round((billableDays / availableDays) * 1000) / 10 : 0,
    billableDays,
    availableDays,
    projectsActive: rows.reduce((a, r) => a + r.projectsActive, 0),
    equipmentIdleHours: rows.reduce((a, r) => a + r.equipmentIdleHours, 0),
    backlogRevenue: rows.reduce((a, r) => a + r.backlogRevenue, 0),
    avgDayRate: Math.round(rows.reduce((a, r) => a + r.avgDayRate, 0) / rows.length),
  };
}

export interface WaterfallStep {
  name: string;
  value: number;
  type: "total" | "delta";
}

export function getEbitdaBridge(filters: Filters): WaterfallStep[] {
  const pnl = getPnl(filters);
  const basis = filters.basis ?? "budget";
  const base = pnl.ebitda[basis];
  const revVar = pnl.revenue.actual - pnl.revenue[basis];
  const cogsVar = -(pnl.cogs.actual - pnl.cogs[basis]); // higher cogs = negative to EBITDA
  const opexVar = -(pnl.opex.actual - pnl.opex[basis]);

  return [
    { name: basis === "priorYear" ? "PY EBITDA" : basis === "forecast" ? "Forecast EBITDA" : "Budget EBITDA", value: base, type: "total" },
    { name: "Revenue var.", value: revVar, type: "delta" },
    { name: "COGS var.", value: cogsVar, type: "delta" },
    { name: "OpEx var.", value: opexVar, type: "delta" },
    { name: "Actual EBITDA", value: pnl.ebitda.actual, type: "total" },
  ];
}

export function getDashboardBundle(filters: Filters) {
  return {
    filters: { ...filters, period: filters.period || latestPeriod },
    pnl: getPnl(filters),
    ops: getOpsKpis(filters),
    varianceByRegion: getVarianceByDimension(filters, "region"),
    varianceByService: getVarianceByDimension(filters, "serviceLine"),
    detailedVariance: getDetailedVariance(filters),
    trend: getTrend({ ...filters, months: 12 }),
    ebitdaBridge: getEbitdaBridge(filters),
  };
}

export { latestPeriod };
