"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { useToast } from "@/components/shared/Toast";

/** "Share" button that copies the article URL and confirms via the global toast. */
export function CopyLink({
  url,
  title,
  compact = false,
}: {
  url?: string;
  /** Post title - included in the "Link copied" toast when present. */
  title?: string;
  /** Icon-only square button, for use inside cards. */
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const copy = async (e: React.MouseEvent) => {
    // Cards wrap this in an <a>; never navigate on a share click.
    e.preventDefault();
    e.stopPropagation();
    const target = url ?? (typeof window !== "undefined" ? window.location.href : "");
    try {
      await navigator.clipboard.writeText(target);
      setCopied(true);
      toast(title ? `Link copied: "${title}"` : "Link copied!");
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      toast("Copy failed — select the URL manually", "error");
    }
  };

  if (compact) {
    return (
      <button
        aria-label={copied ? "Link copied" : "Copy link to share"}
        title="Share"
        className="inline-flex items-center justify-center w-8 h-8 shrink-0 bg-surface-container-lowest text-on-surface border-2 border-on-surface rounded-lg shadow-[2px_2px_0px_0px_var(--color-ink)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_var(--color-ink)] hover:text-primary active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
        type="button"
        onClick={copy}
      >
        <Icon name={copied ? "check" : "link"} size={15} />
      </button>
    );
  }

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
