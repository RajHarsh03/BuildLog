"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/shared/Icon";
import { cn } from "@/lib/utils";

interface ArticleFiltersProps {
  categories: { name: string; count: number }[];
  tags: { name: string; count: number }[];
  totalCount: number;
}

/** One dropdown option: label + optional muted count suffix. */
interface Opt {
  value: string;
  label: string;
  count?: number;
}

export function ArticleFilters({ categories, tags, totalCount }: ArticleFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") ?? "all";
  const activeTag = searchParams.get("tag") ?? "";
  const activeQ = searchParams.get("q") ?? "";
  const activeSort = searchParams.get("sort") ?? "newest";
  const [searchValue, setSearchValue] = useState(activeQ);

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

  const activeCount =
    (activeCategory !== "all" ? 1 : 0) +
    (activeTag ? 1 : 0) +
    (activeQ ? 1 : 0) +
    (activeSort !== "newest" ? 1 : 0);

  return (
    <section aria-label="Search and Filters">
      <div className="bg-surface-container-lowest border-2 border-[var(--color-ink)] shadow-[4px_4px_0px_var(--color-ink)] rounded-lg p-4 flex flex-wrap items-center gap-3">
        {/* Search takes the remaining width; dropdowns sit right */}
        <form onSubmit={submitSearch} className="relative flex-1 basis-full lg:basis-auto min-w-[220px]">
          <label className="sr-only" htmlFor="archive-search">
            Search technical logs
          </label>
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface">
            <Icon name="search" size={18} />
          </div>
          <input
            className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest text-on-surface font-mono-code text-[13px] border-2 border-[var(--color-ink)] rounded shadow-[2px_2px_0px_var(--color-ink)] focus:outline-none focus:border-primary focus:shadow-[3px_3px_0px_#ab2f00] placeholder:text-outline transition-all"
            id="archive-search"
            placeholder={`Search across ${totalCount} articles (e.g. Postgres, React, auth)...`}
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </form>

        {/* Category / tag / sort dropdowns */}
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <Dropdown
            ariaLabel="Filter by category"
            value={activeCategory}
            active={activeCategory !== "all"}
            options={[
              { value: "all", label: "All Categories", count: totalCount },
              ...categories.map((c) => ({ value: c.name, label: c.name, count: c.count })),
            ]}
            onChange={(v) => pushParams({ category: v, page: null })}
          />
          <Dropdown
            ariaLabel="Filter by tag"
            value={activeTag || "all"}
            active={activeTag !== ""}
            options={[
              { value: "all", label: "All Tags" },
              ...tags.map((t) => ({ value: t.name, label: `#${t.name}`, count: t.count })),
            ]}
            onChange={(v) => pushParams({ tag: v === "all" ? null : v, page: null })}
          />
          <Dropdown
            ariaLabel="Sort articles"
            value={activeSort}
            active={activeSort !== "newest"}
            options={[
              { value: "newest", label: "Newest First" },
              { value: "oldest", label: "Oldest First" },
              { value: "popular", label: "Most Popular" },
            ]}
            onChange={(v) => pushParams({ sort: v })}
          />
          {activeCount > 0 && (
            <button
              className="inline-flex items-center gap-1 px-3 py-2 font-mono-code text-label-sm font-bold text-on-surface-variant hover:text-primary border-2 border-transparent hover:border-[var(--color-ink)] rounded transition-all"
              type="button"
              onClick={resetAll}
            >
              <Icon name="restart_alt" size={16} />
              Reset
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/** Custom dropdown: compact button + capped-height scrollable list (native
 * select popups can't be size-constrained cross-browser). */
function Dropdown({
  ariaLabel,
  value,
  options,
  active,
  onChange,
}: {
  ariaLabel: string;
  value: string;
  options: Opt[];
  active: boolean;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value) ?? options[0];
  const optionText = (o: Opt) => (o.count != null ? `${o.label} (${o.count})` : o.label);

  return (
    <div className="relative" ref={rootRef}>
      <button
        aria-expanded={open}
        aria-label={ariaLabel}
        className={cn(
          "inline-flex items-center gap-1.5 pl-3 pr-2.5 py-2 font-mono-code text-[13px] border-2 border-[var(--color-ink)] rounded shadow-[2px_2px_0px_var(--color-ink)] transition-all cursor-pointer",
          active
            ? "bg-primary text-on-primary font-bold"
            : "bg-surface-container-lowest text-on-surface font-semibold hover:bg-surface-container",
        )}
        type="button"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="max-w-[190px] truncate">{optionText(selected)}</span>
        <Icon name={open ? "expand_less" : "expand_more"} size={16} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-full mt-2 z-30 min-w-full max-w-[300px] max-h-52 overflow-y-auto bg-surface-container-lowest border-2 border-[var(--color-ink)] shadow-[4px_4px_0px_var(--color-ink)] rounded-lg py-1"
        >
          {options.map((o) => {
            const sel = o.value === value;
            return (
              <li key={o.value}>
                <button
                  aria-selected={sel}
                  className={cn(
                    "w-full text-left px-3 py-1.5 font-mono-code text-[13px] flex items-center justify-between gap-3 transition-colors",
                    sel
                      ? "bg-primary-container text-on-primary-container font-bold"
                      : "text-on-surface hover:bg-surface-container",
                  )}
                  role="option"
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                >
                  <span className="truncate">{o.label}</span>
                  {o.count != null && (
                    <span className={cn("shrink-0", sel ? "opacity-80" : "opacity-50")}>
                      ({o.count})
                    </span>
                  )}
                  {sel && <Icon name="check" size={14} className="shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
