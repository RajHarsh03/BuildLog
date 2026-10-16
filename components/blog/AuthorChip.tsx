import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import { author } from "@/lib/utils";

/**
 * "Written by" mini-bio card. Rendered in the article sidebar on desktop
 * and again below the article body on mobile (where the sidebar is hidden).
 */
export function AuthorChip({ url, title }: { url: string; title: string }) {
  return (
    <div className="bg-surface-container-lowest border-2 border-on-surface rounded-lg p-4 shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] transition-all">
      <div className="font-mono-code text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2.5">
        Written by
      </div>
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={`${author.name} avatar`}
          className="w-12 h-12 rounded-full border-2 border-on-surface object-cover shrink-0 shadow-[2px_2px_0px_0px_var(--color-ink)]"
          src={author.avatar}
        />
        <div className="min-w-0">
          <div className="font-headline-sm text-headline-sm font-bold text-on-surface leading-tight truncate">
            {author.name}
          </div>
          <div className="font-mono-code text-[11px] uppercase tracking-wider text-primary font-bold truncate">
            {author.role}
          </div>
        </div>
      </div>
      <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant leading-snug">
        I document the messy realities of software architecture - no sponsors,
        no paywalls, pure signal.
      </p>
      <div className="mt-3 pt-3 border-t-2 border-dashed border-on-surface/25 flex items-center justify-between gap-2 font-mono-code text-label-sm">
        <a
          className="inline-flex items-center gap-0.5 text-primary font-bold hover:underline"
          href={author.website}
          target="_blank"
          rel="noopener noreferrer"
        >
          {author.handle}
          <Icon name="arrow_outward" size={13} />
        </a>
        <Link
          className="inline-flex items-center gap-1 text-on-surface-variant font-semibold hover:text-primary transition-colors"
          href="/about"
        >
          <span>About</span>
          <Icon name="arrow_forward" size={14} />
        </Link>
      </div>

      {/* Share this post: X + LinkedIn (copy-link already lives in the header) */}
      <div className="mt-3 pt-3 border-t-2 border-on-surface/10 flex items-center gap-1.5">
        <span className="mr-auto font-mono-code text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
          Share
        </span>
        <a
          aria-label="Share on X"
          className="inline-flex items-center justify-center w-7 h-7 rounded bg-surface-container-lowest text-on-surface border-2 border-on-surface hover:text-primary hover:border-primary active:translate-y-px transition-colors"
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
          rel="noopener noreferrer"
          target="_blank"
          title="Share on X"
        >
          <svg aria-hidden="true" fill="currentColor" height="12" viewBox="0 0 24 24" width="12">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" />
          </svg>
        </a>
        <a
          aria-label="Share on LinkedIn"
          className="inline-flex items-center justify-center w-7 h-7 rounded bg-surface-container-lowest text-on-surface border-2 border-on-surface hover:text-primary hover:border-primary active:translate-y-px transition-colors"
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
          rel="noopener noreferrer"
          target="_blank"
          title="Share on LinkedIn"
        >
          <svg aria-hidden="true" fill="currentColor" height="13" viewBox="0 0 24 24" width="13">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 18.34V9.9H5.67v8.44h2.67zM7 8.62a1.56 1.56 0 1 0 0-3.12 1.56 1.56 0 0 0 0 3.12zm11.34 9.72v-4.63c0-2.47-1.32-3.62-3.08-3.62-1.42 0-2.06.78-2.42 1.33V9.9h-2.66v8.44h2.66v-4.71c0-1.11.21-2.19 1.59-2.19 1.36 0 1.38 1.27 1.38 2.26v4.64h2.53z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
