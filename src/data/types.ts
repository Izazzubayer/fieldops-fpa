export type Region = "Pacific" | "Prairies" | "Ontario" | "Atlantic";
export type ServiceLine =
  | "CPT"
  | "Drilling"
  | "Lab Testing"
  | "Instrumentation"
  | "Consulting";

export type PeriodKey = string; // YYYY-MM

export interface FinancialRow {
  period: PeriodKey;
  region: Region;
  serviceLine: ServiceLine;
  actualRevenue: number;
  budgetRevenue: number;
  forecastRevenue: number;
  priorYearRevenue: number;
  actualCogs: number;
  budgetCogs: number;
  forecastCogs: number;
  priorYearCogs: number;
  actualOpex: number;
  budgetOpex: number;
  forecastOpex: number;
  priorYearOpex: number;
}

export interface OpsRow {
  period: PeriodKey;
  region: Region;
  serviceLine: ServiceLine;
  utilizationPct: number;
  billableDays: number;
  availableDays: number;
  projectsActive: number;
  equipmentIdleHours: number;
  avgDayRate: number;
  backlogRevenue: number;
}

export interface VarianceDriver {
  code: "volume" | "rate" | "mix" | "cost" | "timing";
  label: string;
  impact: number;
  note: string;
}

export type CompareBasis = "budget" | "forecast" | "priorYear";
export type PeriodMode = "MTD" | "QTD" | "YTD";
