import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import type { PostSummary } from "@/types/post";
import { formatDate } from "@/lib/utils";

export function FeaturedArticle({ post }: { post: PostSummary }) {
  return (
    <article className="w-full bg-surface-container-lowest border-2 border-on-surface shadow-[4px_4px_0px_0px_var(--color-ink)] rounded-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12 group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] transition-all">
      {/* Left: abstract system blueprint visual */}
      <div className="lg:col-span-5 bg-paper border-b-2 lg:border-b-0 lg:border-r-2 border-on-surface p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between z-10">
          <span className="font-mono-code text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-primary-fixed text-on-primary-fixed border border-on-surface">
            Featured Post
          </span>
          <span className="font-mono-code text-xs text-on-surface-variant font-semibold">
            {post.category}
          </span>
        </div>

        <div className="py-8 z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-mono-code bg-surface border-2 border-on-surface p-3 shadow-[2px_2px_0px_0px_var(--color-ink)] rounded">
            <span className="flex items-center gap-1.5 text-on-surface font-bold">
              <span className="w-2 h-2 rounded-full bg-primary-container" />
              Entry Signal
            </span>
            <span className="text-primary font-bold">{post.readingTime} min</span>
          </div>
          <div className="flex justify-center my-0.5">
            <Icon name="south" size={18} className="text-on-surface" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono-code">
            <div className="bg-surface border-2 border-on-surface p-2.5 shadow-[2px_2px_0px_0px_var(--color-ink)] rounded">
              <div className="text-[10px] text-on-surface-variant font-bold uppercase">Tags</div>
              <div className="font-bold text-on-surface mt-0.5">{post.tags.length} topics</div>
            </div>
            <div className="bg-[#FEF3C7] border-2 border-on-surface p-2.5 shadow-[2px_2px_0px_0px_var(--color-ink)] rounded">
              <div className="text-[10px] text-[#92400E] font-bold uppercase">Published</div>
              <div className="font-bold text-[#92400E] mt-0.5">
                {formatDate(post.publishedAt ?? post.createdAt)}
              </div>
            </div>
          </div>
        </div>

        <div className="font-mono-code text-[10px] sm:text-xs text-on-surface-variant z-10 flex items-center justify-between gap-4">
          <span>Field Notes &amp; Architecture</span>
          <span className="text-tertiary font-bold">
            {post.readingTime >= 10 ? "Long Read" : "Short Read"}
          </span>
        </div>
      </div>

      {/* Right: content */}
      <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-end gap-1.5 font-mono-code text-[11px] sm:text-xs font-bold text-secondary">
            <Icon name="visibility" size={16} />
            <span>{post.views.toLocaleString()} VIEWS</span>
          </div>
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface group-hover:text-primary transition-colors">
            <Link href={`/articles/${post.slug}`}>{post.title}</Link>
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            {post.excerpt}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t-2 border-surface-container">
          <div className="flex flex-wrap items-center gap-1.5">
            {post.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="font-mono-code text-xs px-2 py-0.5 bg-surface-container border border-on-surface rounded text-on-surface"
              >
                {tag}
              </span>
            ))}
          </div>
          <Link
            className="inline-flex items-center gap-1.5 self-end sm:self-auto font-mono-code text-mono-code font-bold text-on-surface group-hover:text-primary transition-colors shrink-0"
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
