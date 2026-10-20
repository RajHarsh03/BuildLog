"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { recordViewedPost } from "@/components/blog/RecentlyViewed";

/** Same visitor reloading within this window counts as ONE view. */
const COOLDOWN_MS = 30 * 60 * 1000;
const stampKey = (postId: string) => `buildlog-view:${postId}`;

/**
 * Counts one page view per visitor and shows the live total inline in the
 * article byline (leading dot separator included so nothing dangles when
 * the count is still hidden pre-fetch).
 * A per-device localStorage timestamp dedupes reloads: fresh visit POSTs
 * the $inc, revisits inside the cooldown only GET the count.
 * The ISR-cached initial count can be stale (or 0 before the first bump),
 * so we render nothing until the fetch returns the real number.
 */
export function ViewTracker({
  postId,
  initial = 0,
  slug,
  title,
  resource = "posts",
}: {
  postId: string;
  /** May be undefined when a cached payload predates the views field. */
  initial?: number;
  /** When provided, the visit is also saved to the reader's local history. */
  slug?: string;
  title?: string;
  /** Which content type this page belongs to - picks the view endpoint. */
  resource?: "posts" | "projects";
}) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (slug && title) recordViewedPost(slug, title);

    let lastSeen = 0;
    try {
      lastSeen = Number.parseInt(localStorage.getItem(stampKey(postId)) ?? "0", 10) || 0;
    } catch {
      /* storage disabled: treat every load as fresh */
    }
    const isFreshVisit = Date.now() - lastSeen > COOLDOWN_MS;

    if (isFreshVisit) {
      try {
        localStorage.setItem(stampKey(postId), String(Date.now()));
      } catch {
        /* ignore */
      }
    }

    // Fresh visit bumps the counter; a revisit just reads the current total.
    fetch(`/api/${resource}/${postId}/view`, { method: isFreshVisit ? "POST" : "GET" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && typeof data?.views === "number") setViews(data.views);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [postId, slug, title, resource]);

  // Nothing trustworthy yet: render no element at all (avoids "0 views").
  if (views === null && !initial) return null;

  const count = views ?? initial ?? 0;

  return (
    <>
      <span className="text-outline">•</span>
      <span className="flex items-center gap-1.5" title="Total page views">
        <Icon name="visibility" size={15} />
        {count.toLocaleString()} {count === 1 ? "view" : "views"}
      </span>
    </>
  );
}
