"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/shared/Icon";

export interface ViewedPost {
  slug: string;
  title: string;
  at: number;
}

const STORAGE_KEY = "buildlog-recent-posts";
const MAX_STORED = 8;
const MAX_SHOWN = 4;
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

/** Append the current article to the visitor's local history (dedup, newest first, stale pruned). */
export function recordViewedPost(slug: string, title: string) {
  try {
    const fresh = Date.now() - MAX_AGE_MS;
    const list = readViewed().filter((p) => p.at > fresh);
    const next = [
      { slug, title, at: Date.now() },
      ...list.filter((p) => p.slug !== slug),
    ].slice(0, MAX_STORED);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage disabled - history is best-effort only */
  }
}

function readViewed(): ViewedPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as ViewedPost[]) : [];
    if (!Array.isArray(parsed)) return [];
    // TTL: visits older than MAX_AGE_MS silently expire.
    const fresh = Date.now() - MAX_AGE_MS;
    return parsed.filter((p) => p && typeof p.slug === "string" && p.at > fresh);
  } catch {
    return [];
  }
}

/**
 * "Recently viewed" strip for the articles page: minimal one-line cards
 * (title + Continue) built from this visitor's localStorage history.
 * Renders nothing on first-ever visit or when the current article is the
 * only one in history - a single "recent" card looks like an ad, not a feature.
 */
export function RecentlyViewed({ excludeSlug }: { excludeSlug?: string }) {
  const [items, setItems] = useState<ViewedPost[]>([]);

  // Read after mount only: localStorage is browser-side, so this stays
  // SSR/hydration-safe (server renders nothing, client fills in).
  useEffect(() => {
    const list = readViewed().filter((p) => p.slug !== excludeSlug);
    setItems(list.slice(0, MAX_SHOWN));
  }, [excludeSlug]);

  if (items.length < 2) return null;

  return (
    <section aria-label="Recently viewed" className="w-full space-y-3">
      <div className="flex items-center gap-2 font-mono-code text-mono-code font-bold uppercase tracking-wider text-on-surface">
        <Icon name="history" size={18} className="text-primary" />
        <span>Recently viewed</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((p) => (
          <Link
            key={p.slug}
            href={`/articles/${p.slug}`}
            className="group flex items-center gap-3 px-4 py-3 bg-surface-container-lowest border-2 border-[var(--color-ink)] rounded-lg shadow-[2px_2px_0px_0px_var(--color-ink)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface-container border-2 border-[var(--color-ink)] shrink-0">
              <Icon name="menu_book" size={15} />
            </span>
            <span className="font-mono-code text-[13px] font-semibold text-on-surface truncate min-w-0 flex-1 group-hover:text-primary transition-colors">
              {p.title}
            </span>
            <span className="inline-flex items-center gap-1 font-mono-code text-[11px] font-bold uppercase text-on-surface-variant group-hover:text-primary shrink-0 transition-colors">
              Continue
              <Icon name="chevron_right" size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
