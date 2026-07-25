import type { FinancialRow, OpsRow, Region, ServiceLine } from "./types";

export const REGIONS: Region[] = ["Pacific", "Prairies", "Ontario", "Atlantic"];
export const SERVICE_LINES: ServiceLine[] = [
  "CPT",
  "Drilling",
  "Lab Testing",
  "Instrumentation",
  "Consulting",
];

/** Demo company — fictional field-services / geotech FP&A dataset */
export const COMPANY = {
  name: "FieldOps Geotechnics",
  tagline: "In-situ testing · Multi-entity FP&A demo",
  asOf: "2026-06",
  fiscalYearStartMonth: 1,
} as const;

const REGION_WEIGHT: Record<Region, number> = {
  Pacific: 1.35,
  Prairies: 1.1,
  Ontario: 1.25,
  Atlantic: 0.75,
};

const SERVICE_WEIGHT: Record<ServiceLine, number> = {
  CPT: 1.4,
  Drilling: 1.55,
  "Lab Testing": 0.7,
  Instrumentation: 0.95,
  Consulting: 0.85,
};

const BASE_DAY_RATE: Record<ServiceLine, number> = {
  CPT: 4200,
  Drilling: 5800,
  "Lab Testing": 2100,
  Instrumentation: 3600,
  Consulting: 2800,
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function periodKeys(start: string, months: number): string[] {
  const [y0, m0] = start.split("-").map(Number);
  const out: string[] = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(y0, m0 - 1 + i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    out.push(`${y}-${m}`);
  }
  return out;
}

function seasonality(month: number): number {
  // Stronger field season spring–fall; softer winter
  const map = [0.72, 0.78, 0.95, 1.08, 1.15, 1.18, 1.12, 1.1, 1.08, 1.0, 0.88, 0.75];
  return map[month - 1];
}

function buildFinancials(): FinancialRow[] {
  const periods = periodKeys("2024-07", 24);
  const rows: FinancialRow[] = [];

  for (const period of periods) {
    const [yearStr, monthStr] = period.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    const season = seasonality(month);
    const growth = 1 + (year - 2024) * 0.06 + (month / 12) * 0.02;

    for (const region of REGIONS) {
      for (const serviceLine of SERVICE_LINES) {
        const key = `${period}|${region}|${serviceLine}`;
        const noise = 0.92 + hash(key) * 0.16;
        const base =
          185000 *
          REGION_WEIGHT[region] *
          SERVICE_WEIGHT[serviceLine] *
          season *
          growth *
          noise;

        // Intentional story beats for interview demo (2026 H1)
        let story = 1;
        let budgetBias = 1.02;
        let forecastBias = 1.0;
        let costPressure = 1;

        if (period === "2026-03" && region === "Prairies" && serviceLine === "Drilling") {
          story = 0.78; // weather / mobilization delay
          costPressure = 1.12;
        }
        if (period === "2026-05" && region === "Pacific" && serviceLine === "CPT") {
          story = 1.22; // large LNG corridor program
        }
        if (period === "2026-06" && serviceLine === "Consulting") {
          story = 1.08;
          budgetBias = 0.96; // under-budgeted demand
        }
        if (region === "Atlantic" && year === 2026 && month <= 6) {
          story *= 0.94; // softer pipeline
          costPressure *= 1.04;
        }
        if (period === "2026-04" && region === "Ontario") {
          forecastBias = 0.97; // forecast tightened mid-quarter
        }

        const actualRevenue = Math.round(base * story);
        const budgetRevenue = Math.round(base * budgetBias);
        const forecastRevenue = Math.round(base * forecastBias * (0.98 + hash(key + "f") * 0.05));
        const priorYearRevenue = Math.round(base / (1.07 + hash(key + "py") * 0.04));

        const cogsRatio = 0.58 + hash(key + "cogs") * 0.08;
        const opexRatio = 0.18 + hash(key + "opex") * 0.05;

        const actualCogs = Math.round(actualRevenue * cogsRatio * costPressure);
        const budgetCogs = Math.round(budgetRevenue * (cogsRatio - 0.01));
        const forecastCogs = Math.round(forecastRevenue * cogsRatio);
        const priorYearCogs = Math.round(priorYearRevenue * (cogsRatio - 0.005));

        const actualOpex = Math.round(actualRevenue * opexRatio);
        const budgetOpex = Math.round(budgetRevenue * (opexRatio - 0.005));
        const forecastOpex = Math.round(forecastRevenue * opexRatio);
        const priorYearOpex = Math.round(priorYearRevenue * opexRatio);

        rows.push({
          period,
          region,
          serviceLine,
          actualRevenue,
          budgetRevenue,
          forecastRevenue,
          priorYearRevenue,
          actualCogs,
          budgetCogs,
          forecastCogs,
          priorYearCogs,
          actualOpex,
          budgetOpex,
          forecastOpex,
          priorYearOpex,
        });
      }
    }
  }

  return rows;
}

function buildOps(financials: FinancialRow[]): OpsRow[] {
  return financials.map((f) => {
    const key = `${f.period}|${f.region}|${f.serviceLine}`;
    const utilBase = 0.62 + hash(key + "u") * 0.28;
    let utilizationPct = Math.min(0.96, utilBase);

    if (f.period === "2026-03" && f.region === "Prairies" && f.serviceLine === "Drilling") {
      utilizationPct = 0.51;
    }
    if (f.period === "2026-05" && f.region === "Pacific" && f.serviceLine === "CPT") {
      utilizationPct = 0.93;
    }

    const availableDays = 22;
    const billableDays = Math.round(availableDays * utilizationPct);
    const avgDayRate =
      BASE_DAY_RATE[f.serviceLine] *
      REGION_WEIGHT[f.region] *
      (0.95 + hash(key + "rate") * 0.12);
    const equipmentIdleHours = Math.round((1 - utilizationPct) * 160 * (0.8 + hash(key + "idle") * 0.4));
    const projectsActive = Math.max(2, Math.round(4 + hash(key + "proj") * 10 * utilizationPct));
    const backlogRevenue = Math.round(f.actualRevenue * (1.1 + hash(key + "back") * 0.9));

    return {
      period: f.period,
      region: f.region,
      serviceLine: f.serviceLine,
      utilizationPct: Math.round(utilizationPct * 1000) / 10,
      billableDays,
      availableDays,
      projectsActive,
      equipmentIdleHours,
      avgDayRate: Math.round(avgDayRate),
      backlogRevenue,
    };
  });
}

export const financials: FinancialRow[] = buildFinancials();
export const ops: OpsRow[] = buildOps(financials);

export const periods = [...new Set(financials.map((r) => r.period))].sort();
export const latestPeriod = COMPANY.asOf;
