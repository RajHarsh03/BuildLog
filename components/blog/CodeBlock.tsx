"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/shared/Icon";

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  children?: React.ReactNode;
  "data-language"?: string;
}

/**
 * Neo-brutalist terminal window wrapper for MDX code blocks (rendered by
 * rehype-pretty-code). Provides window chrome + a copy-to-clipboard button.
 */
export function CodeBlock({ children, ...props }: CodeBlockProps) {
  const language = props["data-language"];
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = ref.current?.querySelector("pre")?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      ref={ref}
      className="code-block border-2 border-on-surface rounded-lg shadow-[4px_4px_0px_0px_var(--color-ink)] overflow-hidden bg-surface-container-lowest my-6"
    >
      <div className="bg-surface-container px-4 py-2.5 border-b-2 border-on-surface flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-3 h-3 rounded-full bg-error border border-on-surface shrink-0" />
          <span className="w-3 h-3 rounded-full bg-secondary-fixed-dim border border-on-surface shrink-0" />
          <span className="w-3 h-3 rounded-full bg-tertiary-fixed-dim border border-on-surface shrink-0" />
          <span className="ml-2 font-mono-code text-label-sm text-on-surface font-semibold truncate">
            {language ? `${language}` : "snippet"}
          </span>
        </div>
        <button
          className="px-2.5 py-1 text-label-sm font-mono-code bg-surface-container-lowest border border-on-surface rounded hover:bg-surface-container-high transition-colors flex items-center gap-1 shrink-0"
          type="button"
          onClick={copy}
        >
          <Icon name={copied ? "check" : "content_copy"} size={14} />
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>
      <pre {...props}>{children}</pre>
    </div>
  );
}
