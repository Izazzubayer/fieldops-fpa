"use client";

import ReactMarkdown from "react-markdown";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="markdown text-sm text-[var(--ink-soft)] leading-relaxed">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h3 className="mt-0 mb-2 text-base font-semibold text-[var(--ink)]">{children}</h3>
          ),
          h2: ({ children }) => (
            <h4 className="mt-4 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)] first:mt-0">
              {children}
            </h4>
          ),
          h3: ({ children }) => (
            <h4 className="mt-3 mb-1.5 text-sm font-semibold text-[var(--ink)]">{children}</h4>
          ),
          p: ({ children }) => <p className="mb-2.5 last:mb-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="mb-2.5 last:mb-0 space-y-1.5 list-disc pl-4">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2.5 last:mb-0 space-y-1.5 list-decimal pl-4">{children}</ol>
          ),
          li: ({ children }) => <li className="pl-0.5">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-[var(--ink)]">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children }) => (
            <code className="rounded bg-[var(--bg-elevated)] px-1 py-0.5 font-[family-name:var(--font-mono)] text-[12px]">
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
