"use client";

import { useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { absoluteUrl } from "@/lib/utils";

/** RSS/dispatch callout with copy-to-clipboard buttons (MVP: feed route is a fast-follow). */
export function RssCallout() {
  const feedUrl = absoluteUrl("/feed.xml");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <aside
      id="rss"
      className="relative overflow-hidden bg-paper border-2 border-[var(--color-ink)] shadow-[6px_6px_0px_var(--color-ink)] rounded-lg p-6 sm:p-8 scroll-mt-32"
    >
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-primary-fixed text-on-primary-fixed font-mono-code text-[11px] font-bold border border-[var(--color-ink)] uppercase tracking-wider rounded">
              Machine Readable
            </span>
            <span className="font-mono-code text-[12px] text-on-surface-variant">/feed.xml</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface leading-tight font-bold">
            Read directly in your feed reader.
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            No algorithmic feeds, newsletter sales pitches, or paywalled previews. Subscribe using
            the raw XML RSS endpoint and receive articles as soon as commits land.
          </p>
        </div>
        <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
          <button
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-surface-container-lowest text-on-surface font-mono-code text-mono-code font-semibold rounded border-2 border-[var(--color-ink)] shadow-[3px_3px_0px_var(--color-ink)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            type="button"
            onClick={copy}
          >
            <Icon name={copied ? "check" : "content_copy"} size={18} />
            <span>{copied ? "Copied!" : "Copy RSS Link"}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
