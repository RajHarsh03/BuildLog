import Link from "next/link";
import { Icon } from "@/components/shared/Icon";

/** 404 for public routes — renders inside the (site) layout chrome. */
export default function SiteNotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-[#FEF3C7] border-2 border-on-surface rounded-lg shadow-[6px_6px_0px_0px_var(--color-ink)]">
        <span className="font-display text-display-mobile text-[#92400E]">404</span>
      </div>
      <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant mt-3 max-w-md mx-auto">
        The log entry or project you are looking for has been moved, renamed, or never
        shipped.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-container text-on-primary font-mono-code text-label-md font-bold uppercase tracking-wider rounded border-2 border-on-surface shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
        >
          <Icon name="article" size={18} />
          Browse articles
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-container-lowest text-on-surface font-mono-code text-label-md font-bold uppercase tracking-wider rounded border-2 border-on-surface shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
        >
          <Icon name="home" size={18} />
          Back home
        </Link>
      </div>
    </div>
  );
}
