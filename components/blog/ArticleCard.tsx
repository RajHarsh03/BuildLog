import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import { CopyLink } from "@/components/blog/CopyLink";
import { Badge, toneForCategory } from "@/components/ui/Badge";
import type { PostSummary } from "@/types/post";
import { absoluteUrl, author, formatDate } from "@/lib/utils";

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
        {post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="font-mono-code text-[10px] px-1.5 py-px bg-surface-container text-on-surface rounded border border-[var(--color-ink)]"
              >
                {tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="font-mono-code text-[10px] px-1.5 py-px text-on-surface-variant rounded border border-[var(--color-ink)]/40">
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}
        {/* Author line */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={`${author.name} avatar`}
              className="w-9 h-9 rounded-full border-2 border-[var(--color-ink)] object-cover shrink-0"
              src={author.avatar}
            />
            <span className="font-mono-code text-[14px] text-on-surface font-bold truncate">
              {author.name}
            </span>
          </div>
          <CopyLink compact url={absoluteUrl(`/articles/${post.slug}`)} title={post.title} />
        </div>
        <div>
          <Link
            className="flex w-full items-center justify-end gap-1.5 font-mono-code text-mono-code font-bold text-primary hover:text-on-surface transition-colors"
            href={`/articles/${post.slug}`}
          >
            <span>Read Article</span>
            <Icon name="arrow_forward" size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}
