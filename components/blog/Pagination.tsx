import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  /** Current filter params (excluding page) used to build page links. */
  query: Record<string, string>;
}

function hrefFor(query: Record<string, string>, page: number): string {
  const params = new URLSearchParams(query);
  if (page <= 1) params.delete("page");
  else params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/articles?${qs}` : "/articles";
}

export function Pagination({ page, totalPages, total, perPage, query }: PaginationProps) {
  if (totalPages <= 1) {
    return (
      <nav
        aria-label="Archive pagination"
        className="pt-4 flex items-center justify-between gap-4 border-t-2 border-[var(--color-ink)]"
      >
        <div className="font-mono-code text-mono-code text-on-surface-variant">
          Viewing <span className="font-bold text-on-surface">{total}</span> article
          {total === 1 ? "" : "s"}
        </div>
      </nav>
    );
  }

  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  // Compact page-number window around the current page.
  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i += 1) pages.push(i);

  const navBtn =
    "w-10 h-10 flex items-center justify-center font-mono-code text-mono-code font-bold border-2 border-[var(--color-ink)] rounded transition-all";

  return (
    <nav
      aria-label="Archive pagination"
      className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 border-[var(--color-ink)]"
    >
      <div className="font-mono-code text-mono-code text-on-surface-variant">
        Viewing items <span className="font-bold text-on-surface">{`${from} - ${to}`}</span> of{" "}
        <span className="font-bold text-on-surface">{total}</span>
      </div>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link aria-label="Previous Page" className={cn(navBtn, "bg-surface-container-lowest text-on-surface shadow-[2px_2px_0px_var(--color-ink)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_var(--color-ink)]")} href={hrefFor(query, page - 1)}>
            <Icon name="chevron_left" size={20} />
          </Link>
        ) : (
          <span aria-label="Previous Page" className={cn(navBtn, "bg-surface-container-high text-outline border-[var(--color-ink)]/40 cursor-not-allowed opacity-60")}>
            <Icon name="chevron_left" size={20} />
          </span>
        )}

        {pages.map((p) =>
          p === page ? (
            <span
              key={p}
              aria-current="page"
              className={cn(navBtn, "bg-primary text-on-primary shadow-[2px_2px_0px_var(--color-ink)]")}
            >
              {p}
            </span>
          ) : (
            <Link
              key={p}
              className={cn(navBtn, "bg-surface-container-lowest text-on-surface shadow-[2px_2px_0px_var(--color-ink)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_var(--color-ink)]")}
              href={hrefFor(query, p)}
            >
              {p}
            </Link>
          ),
        )}

        {page < totalPages ? (
          <Link
            className="px-3.5 h-10 flex items-center gap-1 bg-surface-container-lowest text-on-surface font-mono-code text-mono-code font-bold border-2 border-[var(--color-ink)] shadow-[2px_2px_0px_var(--color-ink)] rounded hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_var(--color-ink)] transition-all"
            href={hrefFor(query, page + 1)}
          >
            <span>Next</span>
            <Icon name="arrow_forward" size={18} />
          </Link>
        ) : (
          <span className="px-3.5 h-10 flex items-center gap-1 bg-surface-container-high text-outline font-mono-code text-mono-code font-bold border-2 border-[var(--color-ink)]/40 rounded cursor-not-allowed opacity-60">
            <span>Next</span>
            <Icon name="arrow_forward" size={18} />
          </span>
        )}
      </div>
    </nav>
  );
}
