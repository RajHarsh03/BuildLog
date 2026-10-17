import type { Metadata } from "next";
import { Suspense } from "react";
import { Icon } from "@/components/shared/Icon";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { ArticleFilters } from "@/components/blog/ArticleFilters";
import { Pagination } from "@/components/blog/Pagination";
import { RecentlyViewed } from "@/components/blog/RecentlyViewed";
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
    <div className="w-full px-5 sm:px-8 pt-8">
      <div className="flex flex-col w-full space-y-12">
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
            <p className="font-headline-md text-body-md md:text-headline-md text-on-surface-variant font-normal leading-relaxed md:leading-snug">
              Notes, experiments, lessons, and architectural postmortems from my journey of building
              software. Written by{" "}
              <span className="text-primary font-semibold underline decoration-2 decoration-primary underline-offset-4">
                {author.name}
              </span>
              .
            </p>
          </div>
        </header>

        {/* Per-visitor history strip (localStorage; hidden until 2+ posts viewed) */}
        <RecentlyViewed />

        {/* Search + filters (client) */}
        <Suspense fallback={null}>
          <ArticleFilters categories={categories} tags={tags} totalCount={totalCount} />
        </Suspense>

        {/* Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 sm:gap-4 pb-2">
            <span className="font-mono-code text-[11px] sm:text-mono-code font-bold text-on-surface uppercase tracking-wide sm:tracking-wider flex items-center gap-1.5 whitespace-nowrap">
              <Icon name="segment" size={16} className="text-primary shrink-0" />
              <span>
                Showing {result.posts.length} of {result.total} articles
              </span>
            </span>
            <span className="font-label-sm text-[11px] sm:text-label-sm text-on-surface-variant whitespace-nowrap shrink-0">
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
      </div>
    </div>
  );
}
