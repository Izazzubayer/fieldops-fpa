"use client";

import { useMemo, useState } from "react";
import { clsx } from "clsx";
import type { VarianceLine } from "@/lib/metrics";
import { formatCurrency, formatPct } from "@/lib/format";

export function VarianceTable({ rows }: { rows: VarianceLine[] }) {
  const [openId, setOpenId] = useState<string | null>(rows[0]?.id ?? null);
  const open = useMemo(() => rows.find((r) => r.id === openId) ?? null, [rows, openId]);

  return (
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
      <div className="overflow-x-auto rounded-md border border-[var(--border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg-elevated)] text-left text-[11px] uppercase tracking-wider text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2 font-medium">Segment</th>
              <th className="px-3 py-2 font-medium text-right">Actual</th>
              <th className="px-3 py-2 font-medium text-right">Compare</th>
              <th className="px-3 py-2 font-medium text-right">Variance</th>
              <th className="px-3 py-2 font-medium text-right">%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const active = r.id === openId;
              const fav = r.variance >= 0;
              return (
                <tr
                  key={r.id}
                  onClick={() => setOpenId(r.id)}
                  className={clsx(
                    "cursor-pointer border-t border-[var(--border)] transition-colors",
                    active ? "bg-[var(--accent-soft)]" : "hover:bg-[var(--bg-elevated)]",
                  )}
                >
                  <td className="px-3 py-2.5 text-[var(--ink)] font-medium">{r.label}</td>
                  <td className="px-3 py-2.5 text-right font-[family-name:var(--font-mono)] tabular-nums">
                    {formatCurrency(r.actual, { compact: true })}
                  </td>
                  <td className="px-3 py-2.5 text-right font-[family-name:var(--font-mono)] tabular-nums text-[var(--muted)]">
                    {formatCurrency(r.compare, { compact: true })}
                  </td>
                  <td
                    className={clsx(
                      "px-3 py-2.5 text-right font-[family-name:var(--font-mono)] tabular-nums font-medium",
                      fav ? "text-[var(--positive)]" : "text-[var(--negative)]",
                    )}
                  >
                    {formatCurrency(r.variance, { compact: true, signed: true })}
                  </td>
                  <td
                    className={clsx(
                      "px-3 py-2.5 text-right font-[family-name:var(--font-mono)] tabular-nums",
                      fav ? "text-[var(--positive)]" : "text-[var(--negative)]",
                    )}
                  >
                    {formatPct(r.variancePct)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
        {open ? (
          <>
            <p className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
              Driver breakdown
            </p>
            <h4 className="mt-1 text-base font-medium text-[var(--ink)]">{open.label}</h4>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              Variance{" "}
              <span
                className={clsx(
                  "font-[family-name:var(--font-mono)] font-medium",
                  open.variance >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]",
                )}
              >
                {formatCurrency(open.variance, { signed: true })}
              </span>{" "}
              ({formatPct(open.variancePct)})
            </p>
            <ul className="mt-4 space-y-3">
              {open.drivers.map((d) => (
                <li
                  key={d.code + d.label}
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-3"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium text-[var(--ink)]">{d.label}</span>
                    <span
                      className={clsx(
                        "font-[family-name:var(--font-mono)] text-sm tabular-nums",
                        d.impact >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]",
                      )}
                    >
                      {formatCurrency(d.impact, { compact: true, signed: true })}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed">{d.note}</p>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm text-[var(--muted)]">Select a row to inspect drivers.</p>
        )}
      </div>
    </div>
  );
}
