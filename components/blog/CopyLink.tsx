"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/shared/Icon";

/** "Share" button that copies the article URL and confirms with a toast. */
export function CopyLink({
  url,
  title,
  compact = false,
}: {
  url?: string;
  /** Post title - shown in the "Link copied!" toast. */
  title?: string;
  /** Icon-only square button, for use inside cards. */
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(false);
  const timers = useRef<{ copy?: ReturnType<typeof setTimeout>; toast?: ReturnType<typeof setTimeout> }>({});

  useEffect(() => () => {
    clearTimeout(timers.current.copy);
    clearTimeout(timers.current.toast);
  }, []);

  const copy = async (e: React.MouseEvent) => {
    // Cards wrap this in an <a>; never navigate on a share click.
    e.preventDefault();
    e.stopPropagation();
    const target = url ?? (typeof window !== "undefined" ? window.location.href : "");
    try {
      await navigator.clipboard.writeText(target);
      setCopied(true);
      setToast(true);
      timers.current.copy = setTimeout(() => setCopied(false), 2000);
      timers.current.toast = setTimeout(() => setToast(false), 3500);
    } catch {
      setCopied(false);
    }
  };

  // Portal to <body>: cards apply hover translate (transform), and any
  // transformed ancestor hijacks position:fixed - without this the toast
  // renders inside the card instead of the viewport corner.
  const toastNode =
    toast && typeof document !== "undefined"
      ? createPortal(
          <div
            role="status"
            className="toast-in fixed bottom-6 right-6 z-50 max-w-sm p-4 bg-surface-container-lowest border-2 border-on-surface rounded-lg shadow-[4px_4px_0px_0px_var(--color-ink)]"
          >
            <div className="flex items-center gap-2 font-headline-sm text-headline-sm font-bold text-on-surface">
              <Icon name="check_circle" size={18} className="text-tertiary-container" />
              Link copied!
            </div>
            {title && (
              <p className="mt-1.5 font-body-sm text-body-sm text-on-surface-variant leading-snug">
                &quot;{title}&quot; URL is ready to share
              </p>
            )}
          </div>,
          document.body,
        )
      : null;

  if (compact) {
    return (
      <>
        <button
          aria-label={copied ? "Link copied" : "Copy link to share"}
          title="Share"
          className="inline-flex items-center justify-center w-8 h-8 shrink-0 bg-surface-container-lowest text-on-surface border-2 border-on-surface rounded-lg shadow-[2px_2px_0px_0px_var(--color-ink)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_var(--color-ink)] hover:text-primary active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          type="button"
          onClick={copy}
        >
          <Icon name={copied ? "check" : "link"} size={15} />
        </button>
        {toastNode}
      </>
    );
  }

  return (
    <>
      <button
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-lowest text-on-surface font-mono-code text-mono-code border-2 border-on-surface rounded-lg shadow-[2px_2px_0px_0px_var(--color-ink)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
        type="button"
        onClick={copy}
      >
        <Icon name={copied ? "check" : "link"} size={16} />
        <span>{copied ? "Copied!" : "Share"}</span>
      </button>
      {toastNode}
    </>
  );
}
