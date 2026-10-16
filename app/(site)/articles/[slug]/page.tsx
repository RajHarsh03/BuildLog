import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/shared/Icon";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { FontSizeToggle } from "@/components/blog/FontSizeToggle";
import { ViewTracker } from "@/components/blog/ViewTracker";
import { CopyLink } from "@/components/blog/CopyLink";
import { renderMdx } from "@/lib/mdx/render";
import {
  getPostBySlug,
  getRelatedPosts,
  getAdjacentPosts,
} from "@/lib/content/posts";
import { absoluteUrl, formatDate, author } from "@/lib/utils";

export const revalidate = 60;

/** Prerender every published article at build time (DB-tolerant). */
export async function generateStaticParams() {
  try {
    const { getPublishedSlugs } = await import("@/lib/content/posts");
    const slugs = await getPublishedSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return []; // New slugs still render on demand and get cached (dynamicParams).
  }
}

type Params = Promise<{ slug: string }>;

function wordCount(content: string): number {
  return content.trim() ? content.trim().split(/\s+/).length : 0;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug).catch(() => null);
  if (!post) return { title: "Article not found" };

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const url = absoluteUrl(`/articles/${post.slug}`);
  const image = post.seoImage || post.coverImage;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      ...(image ? { images: [{ url: image }] } : {}),
      publishedTime: post.publishedAt ?? post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [author.name],
      tags: post.tags,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug).catch(() => null);
  if (!post) notFound();

  const [{ content, toc }, related, adjacent] = await Promise.all([
    renderMdx(post.content),
    getRelatedPosts(post, 3).catch(() => []),
    getAdjacentPosts(post).catch(() => ({ prev: null, next: null })),
  ]);

  const words = wordCount(post.content);
  const url = absoluteUrl(`/articles/${post.slug}`);
  const published = post.publishedAt ?? post.createdAt;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    ...(post.coverImage ? { image: [post.coverImage] } : {}),
    datePublished: published,
    dateModified: post.updatedAt,
    author: { "@type": "Person", name: author.name },
    publisher: { "@type": "Organization", name: "BuildLog" },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    keywords: post.tags.join(", "),
    articleSection: post.category,
    wordCount: words,
  };

  return (
    <>
      {/* Runs while the HTML is still parsing, before any of the page below
          paints: restores the saved font-size as an html attribute. All zoom
          styling lives in globals.css keyed on this attribute, so prose and
          the A-/A+ buttons render at the right size from the very first
          frame. Mirrors components/blog/FontSizeToggle.tsx. */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            `try{var z=parseInt(localStorage.getItem("buildlog-font-size")||"0",10);if(z){document.documentElement.setAttribute("data-font-size",String(z));}}catch(e){}`,
        }}
      />
      <div className="w-full px-5 sm:px-8 py-8">
        <script
          type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex flex-col w-full">
        {/* Header */}
        <header className="w-full pb-8 mb-10 border-b-2 border-on-surface">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Breadcrumbs
              items={[
                { label: "Articles", href: "/articles" },
                {
                  label: post.category,
                  href: `/articles?category=${encodeURIComponent(post.category)}`,
                },
                { label: post.title },
              ]}
            />
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm uppercase tracking-wider rounded-lg border-2 border-on-surface shadow-[2px_2px_0px_0px_var(--color-ink)]">
                <span className="w-2 h-2 rounded-full bg-tertiary" />
                {post.category}
              </span>
            </div>
          </div>

          <h1 className="font-headline-lg text-headline-lg-mobile md:text-[46px] md:leading-[54px] text-on-surface font-semibold tracking-tight max-w-4xl mb-4">
            {post.title}
          </h1>

          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl leading-relaxed mb-6">
            {post.excerpt}
          </p>

          {/* Tags row - under the excerpt, links into the tag filter */}
          {post.tags.length > 0 && (
            <div className="mb-8 flex flex-wrap items-center gap-1.5">
              {/* Material glyphs carry ~25% internal padding, so the em box must
                  run bigger than the chip to read at the same visual size. */}
              <span className="inline-flex items-center justify-center w-7 h-7 text-on-surface-variant">
                <Icon name="label" size={25} />
              </span>
              {post.tags.map((t) => (
                <Link
                  key={t}
                  className="px-1.5 py-px bg-surface-container-lowest border border-on-surface rounded font-mono-code text-[10px] text-on-surface hover:text-primary hover:border-primary transition-colors"
                  href={`/articles?tag=${encodeURIComponent(t)}`}
                >
                  {t}
                </Link>
              ))}
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-6 border-t border-surface-container-highest">
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 font-mono-code text-mono-code text-on-surface-variant">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={author.name}
                  className="w-6 h-6 rounded-full border border-on-surface object-cover"
                  src={author.avatar}
                />
                <span className="text-on-surface font-medium">{author.name}</span>
              </div>
              <span className="text-outline">•</span>
              <time dateTime={published}>{formatDate(published)}</time>
              <span className="text-outline">•</span>
              <span>{post.readingTime} min read</span>
              <span className="text-outline">•</span>
              <span>{words.toLocaleString()} words</span>
              <ViewTracker postId={post._id} initial={post.views} />
            </div>
            <div className="flex items-center gap-2 self-start lg:self-auto">
              <FontSizeToggle />
              <CopyLink url={url} title={post.title} />
            </div>
          </div>
        </header>

        {/* Body: sticky rail + prose */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative">
          <aside className="hidden lg:block lg:col-span-4 self-start sticky top-28 space-y-6">
            {toc.length > 0 && <TableOfContents items={toc} />}

            {/* Author chip - "written by" card with quick share actions */}
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
                I document the messy realities of software architecture - no
                sponsors, no paywalls, pure signal.
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
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`}
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
          </aside>

          <article
            className="mdx-content lg:col-span-8 max-w-[720px] w-full text-on-surface transition-all"
            id="article-prose"
          >
            {content}
          </article>
        </div>

        {/* Prev / next */}
        {(adjacent.prev || adjacent.next) && (
          <nav className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {adjacent.prev ? (
              <Link
                className="group p-5 bg-surface-container-lowest border-2 border-on-surface rounded-lg shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] transition-all"
                href={`/articles/${adjacent.prev.slug}`}
              >
                <div className="font-mono-code text-label-sm text-on-surface-variant flex items-center gap-1 mb-2">
                  <Icon name="arrow_back" size={14} />
                  Previous
                </div>
                <div className="font-headline-sm text-headline-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                  {adjacent.prev.title}
                </div>
              </Link>
            ) : (
              <span />
            )}
            {adjacent.next && (
              <Link
                className="group p-5 bg-surface-container-lowest border-2 border-on-surface rounded-lg shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] transition-all sm:text-right"
                href={`/articles/${adjacent.next.slug}`}
              >
                <div className="font-mono-code text-label-sm text-on-surface-variant flex items-center gap-1 mb-2 sm:justify-end">
                  Next
                  <Icon name="arrow_forward" size={14} />
                </div>
                <div className="font-headline-sm text-headline-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                  {adjacent.next.title}
                </div>
              </Link>
            )}
          </nav>
        )}

        {/* Footer: related posts */}
        <footer className="mt-16 pt-12 border-t-2 border-on-surface space-y-12">
          {related.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-primary border border-on-surface" />
                  <h3 className="font-mono-code text-mono-code font-bold uppercase tracking-wider text-on-surface">
                    More From The Journal
                  </h3>
                </div>
                <Link
                  className="font-mono-code text-label-sm text-primary font-bold hover:underline flex items-center gap-1"
                  href="/articles"
                >
                  View all logs <Icon name="arrow_forward" size={14} />
                </Link>
              </div>
              {/* 3-up max: 2 cards each take half the row; a lone card keeps
                  the 1/3 card size instead of stretching full width. */}
              <div
                className={
                  related.length === 2
                    ? "grid grid-cols-1 sm:grid-cols-2 gap-6"
                    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                }
              >
                {related.map((r) => (
                  <Link
                    key={r._id}
                    className="group p-5 bg-surface-container-lowest border-2 border-on-surface rounded-lg shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] transition-all flex flex-col justify-between"
                    href={`/articles/${r.slug}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between font-mono-code text-label-sm">
                        <span className="text-primary font-bold">{r.category.toUpperCase()}</span>
                        <span className="text-on-surface-variant">
                          {formatDate(r.publishedAt ?? r.createdAt)}
                        </span>
                      </div>
                      <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface group-hover:text-primary transition-colors leading-snug">
                        {r.title}
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                        {r.excerpt}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-surface-container font-mono-code text-label-sm text-on-surface-variant flex items-center justify-between">
                      <span>{r.readingTime} min read</span>
                      <Icon
                        name="arrow_forward"
                        size={16}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </footer>
        </div>
      </div>
    </>
  );
}
