"use client";

import ReactMarkdown from "react-markdown";
import { clsx } from "clsx";

function textFromChildren(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(textFromChildren).join("");
  if (children && typeof children === "object" && "props" in children) {
    const el = children as { props?: { children?: React.ReactNode } };
    return textFromChildren(el.props?.children);
  }
  return "";
}

function sectionTone(title: string): {
  card: string;
  label: string;
  border: string;
} {
  const t = title.toLowerCase();
  if (t.includes("recommended") || t.includes("action")) {
    return {
      card: "bg-[var(--positive-soft)] border-[var(--positive-border)]",
      label: "text-[var(--positive)]",
      border: "border-[var(--positive-border)]",
    };
  }
  if (t.includes("risk")) {
    return {
      card: "bg-[var(--warn-soft)] border-[var(--warn-border)]",
      label: "text-[var(--warn)]",
      border: "border-[var(--warn-border)]",
    };
  }
  if (t.includes("ops") || t.includes("finance")) {
    return {
      card: "bg-[var(--info-soft)] border-[var(--info-border)]",
      label: "text-[var(--accent)]",
      border: "border-[var(--info-border)]",
    };
  }
  if (t.includes("moved") || t.includes("headline") || t.includes("what")) {
    return {
      card: "bg-[var(--accent-soft)] border-[var(--accent-mid)]",
      label: "text-[var(--accent)]",
      border: "border-[var(--accent-mid)]",
    };
  }
  return {
    card: "bg-[var(--surface)] border-[var(--border)]",
    label: "text-[var(--muted)]",
    border: "border-[var(--border)]",
  };
}

/** Split markdown into ## sections and color-code cards by meaning. */
export function SectionedMarkdown({ children }: { children: string }) {
  const parts = children.split(/\n(?=##\s+)/);
  const lead = parts[0]?.startsWith("##") ? null : parts[0];
  const sections = parts.filter((p) => p.trim().startsWith("##"));

  return (
    <div className="space-y-3">
      {lead?.trim() && (
        <div className="rounded-lg border border-[var(--accent-mid)] bg-[var(--accent-soft)] px-3.5 py-3">
          <MarkdownBody>{lead.trim()}</MarkdownBody>
        </div>
      )}
      {sections.map((block) => {
        const match = block.match(/^##\s+(.+)\n?([\s\S]*)$/);
        const title = match?.[1]?.trim() ?? "Section";
        const body = match?.[2]?.trim() ?? "";
        const tone = sectionTone(title);
        return (
          <div
            key={title + body.slice(0, 24)}
            className={clsx("rounded-lg border px-3.5 py-3", tone.card)}
          >
            <p
              className={clsx(
                "mb-2 text-[11px] font-semibold uppercase tracking-wider",
                tone.label,
              )}
            >
              {title}
            </p>
            {body ? <MarkdownBody>{body}</MarkdownBody> : null}
          </div>
        );
      })}
    </div>
  );
}

function MarkdownBody({ children }: { children: string }) {
  return (
    <div className="markdown text-sm text-[var(--ink-soft)] leading-relaxed">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h3 className="mt-0 mb-2 text-base font-semibold text-[var(--ink)]">{children}</h3>
          ),
          h2: ({ children }) => {
            const title = textFromChildren(children);
            const tone = sectionTone(title);
            return (
              <h4
                className={clsx(
                  "mt-4 mb-2 text-[11px] font-semibold uppercase tracking-wider first:mt-0",
                  tone.label,
                )}
              >
                {children}
              </h4>
            );
          },
          h3: ({ children }) => (
            <h4 className="mt-3 mb-1.5 text-sm font-semibold text-[var(--ink)]">{children}</h4>
          ),
          p: ({ children }) => <p className="mb-2.5 last:mb-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="mb-0 space-y-1.5 list-disc pl-4">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-0 space-y-1.5 list-decimal pl-4">{children}</ol>
          ),
          li: ({ children }) => <li className="pl-0.5">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-[var(--ink)]">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children }) => (
            <code className="rounded bg-black/5 px-1 py-0.5 font-[family-name:var(--font-mono)] text-[12px]">
              {children}
            </code>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

export function Markdown({
  children,
  sectioned = false,
}: {
  children: string;
  sectioned?: boolean;
}) {
  if (sectioned) return <SectionedMarkdown>{children}</SectionedMarkdown>;
  return <MarkdownBody>{children}</MarkdownBody>;
}
