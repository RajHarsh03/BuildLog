"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import type { TocItem } from "@/types/post";
import { cn } from "@/lib/utils";

const ARTICLE_ID = "article-prose";

/** Sticky TOC card with a live reading-progress meter and scroll-spy highlighting. */
export function TableOfContents({ items }: { items: TocItem[] }) {
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const article = document.getElementById(ARTICLE_ID);
    if (!article) return;

    const onScroll = () => {
      const rect = article.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const articleHeight = rect.height;
      const windowHeight = window.innerHeight;
      const currentScroll = window.scrollY;

      let pct = 0;
      if (currentScroll > articleTop) {
        pct = Math.min(
          100,
          Math.max(0, ((currentScroll - articleTop) / (articleHeight - windowHeight + 150)) * 100),
        );
      }
      setProgress(Math.round(pct));

      // Highlight the last section heading that has scrolled past the offset.
      const headings = article.querySelectorAll<HTMLElement>("h2[id], h3[id]");
      let current = "";
      headings.forEach((h) => {
        if (h.getBoundingClientRect().top <= 140) current = h.id;
      });
      setActiveId(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <nav
      aria-label="Table of Contents"
      className="bg-surface-container-lowest border-2 border-on-surface rounded-lg p-5 shadow-[4px_4px_0px_0px_var(--color-ink)]"
    >
      <div className="flex items-center justify-between border-b-2 border-on-surface pb-3 mb-4">
        <span className="font-mono-code text-mono-code uppercase font-bold tracking-wider text-on-surface flex items-center gap-2">
          <Icon name="menu_book" size={18} className="text-primary" />
          Index / Contents
        </span>
        <span className="font-mono-code text-label-sm text-primary font-bold">{progress}% READ</span>
      </div>
      <div className="w-full bg-surface-container-high h-2 rounded-sm border border-on-surface mb-5 overflow-hidden">
        <div
          className="bg-primary h-full transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
      <ul className="space-y-2.5 font-mono-code text-mono-code">
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              className={cn(
                "group flex items-start gap-2 hover:text-primary transition-colors py-1",
                item.depth === 3 && "pl-4",
                activeId === item.id
                  ? "text-primary font-bold"
                  : "text-on-surface-variant",
              )}
              href={`#${item.id}`}
            >
              <span className="text-outline text-label-sm group-hover:text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="leading-snug">{item.text}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
