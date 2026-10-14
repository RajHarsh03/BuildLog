"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const ARTICLE_ID = "article-prose";

/** A-/A+ control that scales the article prose between small, default and large. */
export function FontSizeToggle() {
  const [zoom, setZoom] = useState(0); // -1 small, 0 default, 1 large

  const apply = (next: number) => {
    const clamped = Math.min(1, Math.max(-1, next));
    setZoom(clamped);
    const article = document.getElementById(ARTICLE_ID);
    if (!article) return;
    if (clamped === 1) {
      article.style.fontSize = "18px";
      article.style.lineHeight = "30px";
    } else if (clamped === -1) {
      article.style.fontSize = "14px";
      article.style.lineHeight = "24px";
    } else {
      article.style.fontSize = "";
      article.style.lineHeight = "";
    }
  };

  return (
    <div className="flex items-center bg-surface-container-lowest border-2 border-on-surface rounded-lg shadow-[2px_2px_0px_0px_var(--color-ink)] p-0.5">
      <button
        className={cn(
          "px-2 py-1 font-mono-code text-mono-code hover:bg-surface-container text-on-surface transition-colors",
          zoom === -1 && "font-bold",
        )}
        title="Decrease font size"
        type="button"
        onClick={() => apply(zoom - 1)}
      >
        A-
      </button>
      <span className="text-outline-variant px-0.5">|</span>
      <button
        className={cn(
          "px-2 py-1 font-mono-code text-mono-code hover:bg-surface-container text-on-surface transition-colors",
          zoom === 1 && "font-bold",
        )}
        title="Increase font size"
        type="button"
        onClick={() => apply(zoom + 1)}
      >
        A+
      </button>
    </div>
  );
}
