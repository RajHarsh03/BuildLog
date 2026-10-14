"use client";

import { useState } from "react";
import { Icon } from "@/components/shared/Icon";

/** "Share" button that copies the article URL to the clipboard. */
export function CopyLink({ url }: { url?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const target = url ?? (typeof window !== "undefined" ? window.location.href : "");
    try {
      await navigator.clipboard.writeText(target);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-lowest text-on-surface font-mono-code text-mono-code border-2 border-on-surface rounded-lg shadow-[2px_2px_0px_0px_var(--color-ink)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
      type="button"
      onClick={copy}
    >
      <Icon name={copied ? "check" : "link"} size={16} />
      <span>{copied ? "Copied!" : "Share"}</span>
    </button>
  );
}
