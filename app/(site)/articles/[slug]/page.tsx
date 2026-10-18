import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/shared/Icon";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { AuthorChip } from "@/components/blog/AuthorChip";
import { FontSizeToggle } from "@/components/blog/FontSizeToggle";
import { ViewTracker } from "@/components/blog/ViewTracker";
import { CopyLink } from "@/components/blog/CopyLink";
import { Comments } from "@/components/blog/Comments";
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
      <div className="w-full px-5 sm:px-8 pt-8">
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
                  className="font-mono-code text-label-sm px-2.5 py-1 bg-surface-container text-on-surface rounded border-2 border-on-surface shadow-[1px_1px_0px_0px_var(--color-ink)] font-bold hover:text-primary hover:border-primary transition-colors"
                  href={`/articles?tag=${encodeURIComponent(t)}`}
                >
                  {t}
                </Link>
              ))}
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-6 border-t border-surface-container-highest">
            {/* Two atomic groups: they wrap as units, so no dangling dots */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono-code text-[12px] sm:text-mono-code text-on-surface-variant">
              <span className="flex items-center gap-2 whitespace-nowrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={author.name}
                  className="w-6 h-6 rounded-full border border-on-surface object-cover"
                  src={author.avatar}
                />
                <span className="text-on-surface font-medium">{author.name}</span>
                <span className="text-outline">•</span>
                <time dateTime={published}>{formatDate(published)}</time>
              </span>
              <span className="flex items-center gap-2 whitespace-nowrap">
                <span>{post.readingTime} min read</span>
                <span className="text-outline">•</span>
                <span>{words.toLocaleString()} words</span>
                <ViewTracker postId={post._id} initial={post.views} slug={post.slug} title={post.title} />
              </span>
            </div>
            <div className="flex w-full items-center justify-between self-start sm:w-auto sm:justify-start sm:gap-4 lg:self-auto">
              <FontSizeToggle />
              <CopyLink url={url} title={post.title} />
            </div>
          </div>
        </header>

        {/* Body: sticky rail + prose */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative">
          <aside className="hidden lg:block lg:col-span-4 self-start sticky top-28 space-y-6">
            {toc.length > 0 && <TableOfContents items={toc} />}

            <AuthorChip url={url} title={post.title} />
          </aside>

          <article
            className="mdx-content lg:col-span-8 max-w-[720px] lg:max-w-none w-full text-on-surface transition-all"
            id="article-prose"
          >
            {/* Cover sits inside the prose measure so it reads as a figure,
                not a full-bleed banner. */}
            {(post.seoImage || post.coverImage) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt={post.title} src={post.seoImage || post.coverImage} />
            )}
            {content}
          </article>
        </div>

        {/* Mini-bio below the article on mobile/tablet (sidebar is desktop-only) */}
        <div className="lg:hidden mt-10">
          <AuthorChip url={url} title={post.title} />
        </div>

        {/* Site-native comments backed by MongoDB; readers sign in with GitHub */}
        <Comments postId={post._id} />

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
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-3 h-3 bg-primary border border-on-surface shrink-0" />
                  <h3 className="font-mono-code text-[11px] sm:text-mono-code font-bold uppercase tracking-wide sm:tracking-wider text-on-surface whitespace-nowrap overflow-hidden text-ellipsis">
                    More From The Journal
                  </h3>
                </div>
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
