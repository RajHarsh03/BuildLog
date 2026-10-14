"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/shared/Icon";
import { cn } from "@/lib/utils";

interface ArticleFiltersProps {
  categories: { name: string; count: number }[];
  tags: { name: string; count: number }[];
  totalCount: number;
}

export function ArticleFilters({ categories, tags, totalCount }: ArticleFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") ?? "all";
  const activeTag = searchParams.get("tag") ?? "";
  const activeSort = searchParams.get("sort") ?? "newest";
  const [searchValue, setSearchValue] = useState(searchParams.get("q") ?? "");

  const pushParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" || value === "all" || value === "newest") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      // Any filter change resets pagination.
      params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    pushParams({ q: searchValue.trim() || null });
  };

  const resetAll = () => {
    setSearchValue("");
    router.replace(pathname, { scroll: false });
  };

  const hasFilters =
    activeCategory !== "all" || activeTag !== "" || activeSort !== "newest" || searchValue !== "";

  return (
    <section aria-label="Search and Filters" className="space-y-4">
      <div className="bg-surface-container-lowest border-2 border-[var(--color-ink)] shadow-[4px_4px_0px_var(--color-ink)] rounded-lg p-5 space-y-5">
        {/* Search + sort */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <form onSubmit={submitSearch} className="lg:col-span-8 relative">
            <label className="sr-only" htmlFor="archive-search">
              Search technical logs
            </label>
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface">
              <Icon name="search" size={20} />
            </div>
            <input
              className="w-full pl-11 pr-4 py-2.5 bg-surface-container-lowest text-on-surface font-mono-code text-mono-code border-2 border-[var(--color-ink)] rounded shadow-[2px_2px_0px_var(--color-ink)] focus:outline-none focus:border-primary focus:shadow-[3px_3px_0px_#ab2f00] placeholder:text-outline transition-all"
              id="archive-search"
              placeholder={`Search across ${totalCount} articles (e.g. Postgres, React, auth)...`}
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </form>
          <div className="lg:col-span-4 flex items-center justify-start lg:justify-end gap-2 font-mono-code text-mono-code">
            <span className="text-on-surface-variant text-label-sm uppercase font-bold shrink-0">
              Sort:
            </span>
            <div className="relative w-full sm:w-auto">
              <select
                aria-label="Sort articles"
                className="w-full sm:w-auto appearance-none pl-3 pr-9 py-2 bg-surface-container-lowest font-mono-code text-mono-code font-semibold text-on-surface border-2 border-[var(--color-ink)] rounded shadow-[2px_2px_0px_var(--color-ink)] transition-all cursor-pointer focus:outline-none"
                value={activeSort}
                onChange={(e) => pushParams({ sort: e.target.value })}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-on-surface">
                <Icon name="expand_more" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="pt-2 border-t-2 border-[var(--color-ink)]/15">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" role="tablist">
            <button
              aria-selected={activeCategory === "all"}
              className={cn(
                "shrink-0 px-3 py-1.5 font-mono-code text-mono-code border-2 border-[var(--color-ink)] shadow-[2px_2px_0px_var(--color-ink)] rounded transition-all",
                activeCategory === "all"
                  ? "bg-primary text-on-primary font-bold"
                  : "bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container",
              )}
              role="tab"
              type="button"
              onClick={() => pushParams({ category: null })}
            >
              All ({totalCount})
            </button>
            {categories.map((c) => (
              <button
                key={c.name}
                aria-selected={activeCategory === c.name}
                className={cn(
                  "shrink-0 px-3 py-1.5 font-mono-code text-mono-code border-2 border-[var(--color-ink)] shadow-[2px_2px_0px_var(--color-ink)] rounded transition-all",
                  activeCategory === c.name
                    ? "bg-primary text-on-primary font-bold"
                    : "bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container",
                )}
                role="tab"
                type="button"
                onClick={() => pushParams({ category: c.name })}
              >
                {c.name} ({c.count})
              </button>
            ))}
          </div>
        </div>

        {/* Tag pills */}
        {tags.length > 0 && (
          <div className="flex items-center flex-wrap gap-2 pt-1">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mr-1 flex items-center gap-1">
              <Icon name="tag" size={15} />
              <span>Filter:</span>
            </span>
            {tags.slice(0, 12).map((t) => (
              <button
                key={t.name}
                className={cn(
                  "px-2.5 py-1 font-label-sm text-label-sm border-2 border-[var(--color-ink)] rounded shadow-[2px_2px_0px_var(--color-ink)] transition-all",
                  activeTag === t.name
                    ? "bg-primary-fixed-dim text-on-primary-fixed"
                    : "bg-surface-container text-on-surface hover:bg-primary-fixed-dim hover:text-on-primary-fixed",
                )}
                type="button"
                onClick={() => pushParams({ tag: activeTag === t.name ? null : t.name })}
              >
                #{t.name}
              </button>
            ))}
            {hasFilters && (
              <button
                className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary underline ml-2 transition-colors"
                type="button"
                onClick={resetAll}
              >
                Reset all
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
