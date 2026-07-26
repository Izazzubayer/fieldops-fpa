import { clsx } from "clsx";

export function KpiCard({
  label,
  value,
  delta,
  deltaLabel,
  tone = "flat",
  hint,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaLabel?: string;
  tone?: "up" | "down" | "flat";
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5">
      <p className="text-[11px] uppercase tracking-wider text-[var(--muted)]">{label}</p>
      <p className="mt-1 font-[family-name:var(--font-mono)] text-2xl text-[var(--ink)] tabular-nums tracking-tight">
        {value}
      </p>
      {(delta || hint) && (
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs">
          {delta && (
            <span
              className={clsx(
                "font-medium tabular-nums",
                tone === "up" && "text-[var(--positive)]",
                tone === "down" && "text-[var(--negative)]",
                tone === "flat" && "text-[var(--muted)]",
              )}
            >
              {delta}
            </span>
          )}
          {deltaLabel && <span className="text-[var(--muted)]">{deltaLabel}</span>}
          {hint && !delta && <span className="text-[var(--muted)]">{hint}</span>}
        </div>
      )}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-6">
      {eyebrow && (
        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--accent)] mb-1.5">
          {eyebrow}
        </p>
      )}
      <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl text-[var(--ink)] tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-2 max-w-2xl text-sm text-[var(--ink-soft)] leading-relaxed">
          {description}
        </p>
      )}
    </header>
  );
}

export function Panel({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
        <h3 className="text-sm font-medium text-[var(--ink)]">{title}</h3>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
