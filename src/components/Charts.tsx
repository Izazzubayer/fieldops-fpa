"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendPoint, WaterfallStep } from "@/lib/metrics";
import { formatCurrency, periodLabel } from "@/lib/format";

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
};

export function RevenueTrendChart({ data }: { data: TrendPoint[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: periodLabel(d.period),
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatCurrency(v, { compact: true })}
            width={56}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => formatCurrency(Number(value), { compact: true })}
          />
          <Area
            type="monotone"
            dataKey="budget"
            name="Budget"
            stroke="var(--muted)"
            fill="var(--bg-elevated)"
            strokeDasharray="4 4"
          />
          <Line
            type="monotone"
            dataKey="actual"
            name="Actual"
            stroke="var(--accent)"
            strokeWidth={2.25}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="forecast"
            name="Forecast"
            stroke="var(--ink-soft)"
            strokeWidth={1.5}
            strokeDasharray="2 3"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function UtilizationChart({ data }: { data: TrendPoint[] }) {
  const chartData = data.map((d) => ({
    label: periodLabel(d.period),
    utilization: d.utilizationPct,
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[40, 100]}
            tick={{ fill: "var(--muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            width={40}
          />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
          <Area
            type="monotone"
            dataKey="utilization"
            name="Utilization"
            stroke="var(--accent)"
            fill="var(--accent-soft)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Simple waterfall using stacked bars */
export function EbitdaBridgeChart({ steps }: { steps: WaterfallStep[] }) {
  let running = 0;
  const data = steps.map((step, i) => {
    if (step.type === "total") {
      running = step.value;
      return {
        name: step.name,
        base: 0,
        value: step.value,
        display: step.value,
        total: true,
      };
    }
    const base = step.value >= 0 ? running : running + step.value;
    running += step.value;
    return {
      name: step.name,
      base,
      value: Math.abs(step.value),
      display: step.value,
      total: false,
      positive: step.value >= 0,
      index: i,
    };
  });

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "var(--muted)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <YAxis
            tick={{ fill: "var(--muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatCurrency(v, { compact: true })}
            width={56}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(_v, _n, item) =>
              formatCurrency(Number((item?.payload as { display: number })?.display ?? 0), {
                compact: true,
                signed: true,
              })
            }
          />
          <Bar dataKey="base" stackId="a" fill="transparent" />
          <Bar dataKey="value" stackId="a" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={
                  d.total
                    ? "var(--ink)"
                    : d.positive
                      ? "var(--positive)"
                      : "var(--negative)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VarianceBarChart({
  data,
}: {
  data: { label: string; variance: number }[];
}) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
        >
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: "var(--muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatCurrency(v, { compact: true })}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={88}
            tick={{ fill: "var(--ink-soft)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v) => formatCurrency(Number(v), { compact: true, signed: true })}
          />
          <Bar dataKey="variance" name="Variance" radius={[0, 4, 4, 0]}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={d.variance >= 0 ? "var(--positive)" : "var(--negative)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
