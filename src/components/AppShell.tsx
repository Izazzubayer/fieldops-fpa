"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitCompareArrows,
  Activity,
  Sparkles,
  FileText,
} from "lucide-react";
import { COMPANY } from "@/data/seed";
import { clsx } from "clsx";

const NAV = [
  { href: "/", label: "Executive Overview", icon: LayoutDashboard },
  { href: "/variance", label: "Variance Lab", icon: GitCompareArrows },
  { href: "/drivers", label: "Ops Drivers", icon: Activity },
  { href: "/ai", label: "AI Analyst", icon: Sparkles },
  { href: "/pack", label: "Monthly Pack", icon: FileText },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <aside className="lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-[var(--border)] bg-[var(--surface)] flex flex-col">
        <div className="px-5 py-5 border-b border-[var(--border)]">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
            Finance platform
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-xl text-[var(--ink)] leading-tight">
            FieldOps Financial Planning & Analysis
          </h1>
          <p className="mt-1 text-xs text-[var(--muted)] leading-snug">
            {COMPANY.tagline}
          </p>
        </div>
        <nav className="flex lg:flex-col gap-1 p-3 overflow-x-auto flex-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm whitespace-nowrap transition-colors",
                  active
                    ? "bg-[var(--accent)] text-white font-medium"
                    : "text-[var(--ink-soft)] hover:bg-[var(--accent-soft)]",
                )}
              >
                <Icon size={16} strokeWidth={1.75} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden lg:block px-5 py-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--positive)]" />
            <p className="text-[11px] text-[var(--muted)]">Workspace connected</p>
          </div>
          <p className="mt-2 text-[11px] text-[var(--muted)] leading-relaxed">
            {COMPANY.name} · Fiscal YTD as of {COMPANY.asOf}
          </p>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
