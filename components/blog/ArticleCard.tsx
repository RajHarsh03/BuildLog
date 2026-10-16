import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import { CopyLink } from "@/components/blog/CopyLink";
import { Badge, toneForCategory } from "@/components/ui/Badge";
import type { PostSummary } from "@/types/post";
import { absoluteUrl, formatDate } from "@/lib/utils";

export function ArticleCard({ post }: { post: PostSummary }) {
  return (
    <article className="group bg-surface-container-lowest border-2 border-[var(--color-ink)] shadow-[4px_4px_0px_var(--color-ink)] rounded-lg p-6 flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--color-ink)] transition-all">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 border-b-2 border-[var(--color-ink)]/10 pb-3">
          <Badge tone={toneForCategory(post.category)}>{post.category}</Badge>
          <span className="font-mono-code text-[12px] text-on-surface-variant">
            {post.readingTime} min read
          </span>
        </div>
        <div className="space-y-2">
          <time
            className="font-mono-code text-mono-code text-on-surface-variant block text-[13px]"
            dateTime={post.publishedAt ?? post.createdAt}
          >
            {formatDate(post.publishedAt ?? post.createdAt)}
          </time>
          <h2 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors leading-tight font-semibold">
            <Link href={`/articles/${post.slug}`} className="focus:outline-none">
              {post.title}
            </Link>
          </h2>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant line-clamp-3">
          {post.excerpt}
        </p>
      </div>
      <div className="pt-6 mt-6 border-t-2 border-[var(--color-ink)]/10 space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono-code text-[11px] px-2 py-0.5 bg-surface-container text-on-surface rounded border border-[var(--color-ink)]"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3">
          <Link
            className="inline-flex items-center gap-1.5 font-mono-code text-mono-code font-bold text-primary group-hover:translate-x-1 transition-transform"
            href={`/articles/${post.slug}`}
          >
            <span>Read Article</span>
            <Icon name="arrow_forward" size={18} />
          </Link>
          <CopyLink compact url={absoluteUrl(`/articles/${post.slug}`)} />
        </div>
      </div>
    </article>
  );
}
