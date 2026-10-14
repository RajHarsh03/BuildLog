import Link from "next/link";
import { Icon } from "@/components/shared/Icon";

/** Root 404 for URLs that match no route group. */
export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center bg-background px-4 py-24">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-[#FEF3C7] border-2 border-on-surface rounded-lg shadow-[6px_6px_0px_0px_var(--color-ink)]">
          <span className="font-display text-display-mobile text-[#92400E]">404</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-semibold tracking-tight">
          Lost in the build
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-3">
          That route does not exist.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 bg-primary-container text-on-primary font-mono-code text-label-md font-bold uppercase tracking-wider rounded border-2 border-on-surface shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
        >
          <Icon name="home" size={18} />
          Back home
        </Link>
      </div>
    </main>
  );
}
