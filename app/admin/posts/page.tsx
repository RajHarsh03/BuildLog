import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PostRowActions } from "@/components/admin/PostRowActions";
import { getAllPostsAdmin } from "@/lib/content/posts";
import { cn, formatDate } from "@/lib/utils";
import type { PostStatus } from "@/types/post";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string }>;

const FILTERS: { key: PostStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
  { key: "archived", label: "Archived" },
];

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { status } = await searchParams;
  const active = (status ?? "all") as PostStatus | "all";

  const posts = await getAllPostsAdmin().catch(() => []);
  const counts = posts.reduce<Record<string, number>>((acc, p) => {
    acc.all = (acc.all ?? 0) + 1;
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});
  const visible = active === "all" ? posts : posts.filter((p) => p.status === active);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        homeLabel="Dashboard"
        homeHref="/admin"
        items={[{ label: "Posts" }]}
      />
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-semibold tracking-tight">
          Posts
        </h1>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-1.5 sm:gap-2 shrink-0 px-2.5 py-1.5 sm:px-4 sm:py-2.5 bg-primary-container text-on-primary font-mono-code text-[11px] sm:text-label-md font-bold uppercase tracking-wider rounded border-2 border-on-surface shadow-[3px_3px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all whitespace-nowrap"
        >
          <Icon name="add" size={16} />
          <span>New post</span>
        </Link>
      </div>

      {/* Filter tabs: mobile = 4 equal chips in one row, desktop = inline wrap */}
      <div className="grid grid-cols-4 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
        {FILTERS.map((f) => {
          const isActive = active === f.key;
          const href =
            f.key === "all" ? "/admin/posts" : `/admin/posts?status=${f.key}`;
          return (
            <Link
              key={f.key}
              href={href}
              className={cn(
                "flex items-center justify-center px-1 py-1 sm:px-3 sm:py-1.5 font-mono-code text-[9px] sm:text-label-sm font-bold uppercase tracking-tight sm:tracking-wider rounded border-2 transition-all whitespace-nowrap",
                isActive
                  ? "bg-on-surface text-surface border-on-surface shadow-[2px_2px_0px_0px_var(--color-ink)]"
                  : "bg-surface-container-lowest text-on-surface-variant border-on-surface hover:text-on-surface",
              )}
            >
              {f.label}
              <span className="ml-0.5 sm:ml-1.5 opacity-70">{counts[f.key] ?? 0}</span>
            </Link>
          );
        })}
      </div>

      {/* List */}
      <div className="bg-surface-container-lowest border-2 border-on-surface rounded-lg shadow-[4px_4px_0px_0px_var(--color-ink)] overflow-hidden">
        {visible.length === 0 ? (
          <div className="p-12 text-center">
            <Icon name="inbox" size={40} className="text-on-surface-variant mx-auto" />
            <p className="font-body-md text-body-md text-on-surface-variant mt-3">
              No posts in this view.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-surface-container-high">
            {visible.map((post) => (
              <li
                key={post._id}
                className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-4 hover:bg-surface-container-low transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-headline-sm text-[15px] sm:text-headline-sm font-semibold text-on-surface truncate">
                      {post.title}
                    </h2>
                    {post.featured && (
                      <Icon name="star" fill size={15} className="text-[#92400E] shrink-0" />
                    )}
                  </div>
                  <div className="font-mono-code text-[10px] sm:text-label-sm text-on-surface-variant mt-1 truncate">
                    <span className="text-primary font-bold">
                      {post.category.toUpperCase()}
                    </span>
                    {" • "}
                    {post.readingTime} min
                    {" • "}
                    Updated {formatDate(post.updatedAt)}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 sm:justify-start sm:gap-3 shrink-0">
                  <StatusBadge
                    status={post.status}
                    pulse={false}
                    className="px-1.5 py-0.5 text-[9px] gap-1 sm:px-2.5 sm:py-1 sm:text-label-sm sm:gap-1.5"
                  />
                  <PostRowActions
                    id={post._id}
                    status={post.status}
                    featured={post.featured}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
