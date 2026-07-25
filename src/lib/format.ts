export function formatCurrency(
  value: number,
  opts: { compact?: boolean; signed?: boolean } = {},
): string {
  const { compact = false, signed = false } = opts;
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
  }).format(abs);

  if (signed) {
    if (value > 0) return `+${formatted}`;
    if (value < 0) return `-${formatted}`;
    return formatted;
  }
  return value < 0 ? `-${formatted}` : formatted;
}

export function formatPct(value: number, digits = 1): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatNumber(value: number, digits = 0): string {
  return new Intl.NumberFormat("en-CA", {
    maximumFractionDigits: digits,
  }).format(value);
}

export function periodLabel(period: string): string {
  const [y, m] = period.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-CA", {
    month: "short",
    year: "numeric",
  });
}

export function varianceTone(value: number, favorableWhenPositive = true): "up" | "down" | "flat" {
  if (Math.abs(value) < 1) return "flat";
  const positive = value > 0;
  if (favorableWhenPositive) return positive ? "up" : "down";
  return positive ? "down" : "up";
}
