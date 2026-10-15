import type { Metadata } from "next";
import { Suspense } from "react";
import { Icon } from "@/components/shared/Icon";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { ArticleFilters } from "@/components/blog/ArticleFilters";
import { Pagination } from "@/components/blog/Pagination";
import { RssCallout } from "@/components/blog/RssCallout";
import {
  getPublishedPosts,
  getCategories,
  getTags,
  POSTS_PER_PAGE,
} from "@/lib/content/posts";
import { absoluteUrl, author } from "@/lib/utils";

export const dynamic = "force-dynamic";

const DESCRIPTION =
  "Notes, experiments, lessons, and architectural postmortems from a journey of building software.";

export const metadata: Metadata = {
  title: "Articles",
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/articles") },
  openGraph: {
    title: "Articles - BuildLog",
    description: DESCRIPTION,
    url: absoluteUrl("/articles"),
    type: "website",
  },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ArticlesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = first(sp.q) ?? "";
  const category = first(sp.category) ?? "all";
  const tag = first(sp.tag) ?? "";
  const sort = (first(sp.sort) as "newest" | "oldest" | "popular") ?? "newest";
  const page = Number.parseInt(first(sp.page) ?? "1", 10) || 1;

  const [result, categories, tags] = await Promise.all([
    getPublishedPosts({ q, category, tag, sort, page, perPage: POSTS_PER_PAGE }).catch(() => ({
      posts: [],
      total: 0,
      page: 1,
      perPage: POSTS_PER_PAGE,
      totalPages: 1,
    })),
    getCategories().catch(() => []),
    getTags().catch(() => []),
  ]);

  const totalCount = categories.reduce((sum, c) => sum + c.count, 0);

  // Preserve current filters (minus page) for pagination links.
  const query: Record<string, string> = {};
  if (q) query.q = q;
  if (category && category !== "all") query.category = category;
  if (tag) query.tag = tag;
  if (sort && sort !== "newest") query.sort = sort;

  return (
    <div className="w-full px-5 sm:px-8 py-8">
      <div className="flex flex-col w-full space-y-12 pb-16">
        {/* Archive header */}
        <header className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Breadcrumbs items={[{ label: "Articles" }]} />
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-lowest border-2 border-[var(--color-ink)] shadow-[2px_2px_0px_var(--color-ink)] rounded">
              <Icon name="history_edu" size={16} className="text-primary" />
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface">
                Journal Index
              </span>
            </div>
          </div>
          <div className="space-y-4 max-w-4xl">
            <h1 className="font-display text-display-mobile md:text-display text-on-surface tracking-tight leading-none">
              All Articles
            </h1>
            <p className="font-headline-md text-headline-lg-mobile md:text-headline-md text-on-surface-variant font-normal leading-snug">
              Notes, experiments, lessons, and architectural postmortems from my journey of building
              software. Written by{" "}
              <span className="text-primary font-semibold underline decoration-2 decoration-primary underline-offset-4">
                {author.name}
              </span>
              .
            </p>
          </div>
          <div className="w-full bg-surface-container-lowest border-2 border-[var(--color-ink)] shadow-[4px_4px_0px_var(--color-ink)] rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 font-mono-code text-mono-code text-on-surface">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
                <span className="font-bold">{totalCount}</span>
                <span className="text-on-surface-variant">Technical Articles</span>
              </div>
              <span className="hidden sm:inline text-outline">•</span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary inline-block" />
                <span className="font-bold">{categories.length}</span>
                <span className="text-on-surface-variant">Categories</span>
              </div>
              <span className="hidden sm:inline text-outline">•</span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container inline-block" />
                <span className="font-bold">{tags.length}</span>
                <span className="text-on-surface-variant">Tags</span>
              </div>
            </div>
            <div className="flex items-center gap-2 font-label-sm text-label-sm uppercase bg-[#FEF3C7] text-[#92400E] px-2.5 py-1 rounded border-2 border-[var(--color-ink)] shadow-[2px_2px_0px_var(--color-ink)]">
              <Icon name="filter_alt" size={15} />
              <span>Filterable by tag &amp; category</span>
            </div>
          </div>
        </header>

        {/* Search + filters (client) */}
        <Suspense fallback={null}>
          <ArticleFilters categories={categories} tags={tags} totalCount={totalCount} />
        </Suspense>

        {/* Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <span className="font-mono-code text-mono-code font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="segment" size={18} className="text-primary" />
              <span>
                Showing {result.posts.length} of {result.total} articles
              </span>
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Page {result.page} of {result.totalPages}
            </span>
          </div>

          {result.posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {result.posts.map((post) => (
                <ArticleCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-lowest border-2 border-[var(--color-ink)] shadow-[4px_4px_0px_var(--color-ink)] rounded-lg p-10 text-center">
              <p className="font-headline-md text-headline-md text-on-surface font-semibold">
                No articles match those filters.
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                Try clearing the search or picking a different category.
              </p>
            </div>
          )}
        </div>

        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          total={result.total}
          perPage={result.perPage}
          query={query}
        />

        <RssCallout />
      </div>
    </div>
  );
}
