import Link from "next/link";
import { Fragment } from "react";

/** Rounded, thick-stroke house glyph (matches the reference icon style). */
function HomeIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 10.5651C3 9.9907 3 9.70352 3.07403 9.43905C3.1396 9.20478 3.24737 8.98444 3.39203 8.78886C3.55534 8.56806 3.78202 8.39175 4.23539 8.03912L11.0177 2.764C11.369 2.49075 11.5447 2.35412 11.7387 2.3016C11.9098 2.25526 12.0902 2.25526 12.2613 2.3016C12.4553 2.35412 12.631 2.49075 12.9823 2.764L19.7646 8.03913C20.218 8.39175 20.4447 8.56806 20.608 8.78886C20.7526 8.98444 20.8604 9.20478 20.926 9.43905C21 9.70352 21 9.9907 21 10.5651V17.8C21 18.9201 21 19.4801 20.782 19.908C20.5903 20.2843 20.2843 20.5903 19.908 20.782C19.4802 21 18.9201 21 17.8 21H6.2C5.07989 21 4.51984 21 4.09202 20.782C3.71569 20.5903 3.40973 20.2843 3.21799 19.908C3 19.4801 3 18.9201 3 17.8V10.5651Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface Crumb {
  label: string;
  /** Omit href for the current page (rendered as the highlighted chip). */
  href?: string;
}

/**
 * Site-wide breadcrumb trail. Always starts with the Home link; the last
 * crumb (no href) renders as a bordered chip. One style for every page.
 * Admin pages override the root crumb to "Dashboard" -> /admin.
 */
export function Breadcrumbs({
  items,
  className,
  homeLabel = "Home",
  homeHref = "/",
}: {
  items: Crumb[];
  className?: string;
  homeLabel?: string;
  homeHref?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex flex-wrap items-center gap-x-1.5 gap-y-2 sm:gap-2 font-mono-code text-[10px] sm:text-mono-code text-on-surface-variant ${className ?? ""}`}
    >
      <Link
        className="hover:text-primary transition-colors flex items-center gap-1.5 shrink-0"
        href={homeHref}
      >
        <HomeIcon />
        <span>{homeLabel}</span>
      </Link>
      {items.map((item, i) => (
        <Fragment key={`${item.label}-${i}`}>
          <span className="text-outline shrink-0">/</span>
          {item.href ? (
            <Link className="hover:text-primary transition-colors shrink-0" href={item.href}>
              {item.label}
            </Link>
          ) : (
            <span className="text-on-surface font-semibold bg-surface-container px-1.5 sm:px-2 py-px sm:py-0.5 rounded shadow-[1px_1px_0px_var(--color-ink)] border-2 border-[var(--color-ink)] min-w-0 max-w-[55vw] sm:max-w-[260px] truncate">
              {item.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
