import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAllPostsAdmin, getPostStats } from "@/lib/content/posts";
import { getAllProjectsAdmin } from "@/lib/content/projects";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  icon,
  href,
  accent,
}: {
  label: string;
  value: number;
  icon: string;
  href: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="group p-5 bg-surface-container-lowest border-2 border-on-surface rounded-lg shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] transition-all"
    >
      <div className="flex items-start justify-between">
        <span
          className={`w-9 h-9 grid place-items-center rounded border-2 border-on-surface ${accent}`}
        >
          <Icon name={icon} size={18} />
        </span>
        <Icon
          name="arrow_forward"
          size={18}
          className="text-on-surface-variant group-hover:translate-x-1 group-hover:text-primary transition-all"
        />
      </div>
      <div className="mt-4 font-display text-display-mobile text-on-surface leading-none">
        {value}
      </div>
      <div className="mt-1 font-mono-code text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
        {label}
      </div>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const [stats, posts, projects] = await Promise.all([
    getPostStats().catch(() => ({ total: 0, published: 0, drafts: 0 })),
    getAllPostsAdmin().catch(() => []),
    getAllProjectsAdmin().catch(() => []),
  ]);

  const recentPosts = posts.slice(0, 6);
  const activeProjects = projects.filter((p) => p.status === "active").length;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Overview of your journal. Build. Learn. Document.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-container text-on-primary font-mono-code text-label-md font-bold uppercase tracking-wider rounded border-2 border-on-surface shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
          >
            <Icon name="add" size={18} />
            <span>New post</span>
          </Link>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest text-on-surface font-mono-code text-label-md font-bold uppercase tracking-wider rounded border-2 border-on-surface shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--color-ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
          >
            <Icon name="add" size={18} />
            <span>New project</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total posts"
          value={stats.total}
          icon="article"
          href="/admin/posts"
          accent="bg-surface-container text-on-surface"
        />
        <StatCard
          label="Published"
          value={stats.published}
          icon="public"
          href="/admin/posts?status=published"
          accent="bg-mint-soft text-mint-ink"
        />
        <StatCard
          label="Drafts"
          value={stats.drafts}
          icon="edit_note"
          href="/admin/posts?status=draft"
          accent="bg-[#FEF3C7] text-[#92400E]"
        />
        <StatCard
          label="Projects"
          value={projects.length}
          icon="rocket_launch"
          href="/admin/projects"
          accent="bg-[#E0E7FF] text-[#1E40AF]"
        />
      </div>

      {/* Recent + projects summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 bg-surface-container-lowest border-2 border-on-surface rounded-lg shadow-[4px_4px_0px_0px_var(--color-ink)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b-2 border-on-surface bg-surface-container-low">
            <h2 className="font-mono-code text-mono-code font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
              <Icon name="history" size={18} />
              Recent posts
            </h2>
            <Link
              href="/admin/posts"
              className="font-mono-code text-label-sm font-bold text-primary hover:underline flex items-center gap-1"
            >
              View all <Icon name="arrow_forward" size={14} />
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">
                No posts yet. Create your first log entry.
              </p>
              <Link
                href="/admin/posts/new"
                className="inline-flex items-center gap-1.5 mt-4 font-mono-code text-label-md font-bold text-primary hover:underline"
              >
                <Icon name="add" size={16} /> Write a post
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-surface-container-high">
              {recentPosts.map((post) => (
                <li key={post._id}>
                  <Link
                    href={`/admin/posts/${post._id}/edit`}
                    className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-surface-container-low transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-headline-sm text-headline-sm font-semibold text-on-surface truncate">
                        {post.title}
                      </div>
                      <div className="font-mono-code text-label-sm text-on-surface-variant mt-0.5">
                        {post.category} • {formatDate(post.updatedAt)}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {post.featured && (
                        <Icon name="star" size={16} className="text-[#92400E]" />
                      )}
                      <StatusBadge status={post.status} pulse={false} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest border-2 border-on-surface rounded-lg shadow-[4px_4px_0px_0px_var(--color-ink)] p-5">
            <h2 className="font-mono-code text-mono-code font-bold uppercase tracking-wider text-on-surface flex items-center gap-2 mb-4">
              <Icon name="rocket_launch" size={18} />
              Projects
            </h2>
            <div className="space-y-2 font-body-md text-body-md">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Total</span>
                <span className="font-mono-code font-bold text-on-surface">
                  {projects.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Active</span>
                <span className="font-mono-code font-bold text-mint-ink">
                  {activeProjects}
                </span>
              </div>
            </div>
            <Link
              href="/admin/projects"
              className="mt-4 inline-flex items-center gap-1.5 font-mono-code text-label-md font-bold text-primary hover:underline"
            >
              Manage projects <Icon name="arrow_forward" size={14} />
            </Link>
          </div>

          <div className="bg-mint-soft border-2 border-on-surface rounded-lg shadow-[4px_4px_0px_0px_var(--color-ink)] p-5">
            <h2 className="font-mono-code text-mono-code font-bold uppercase tracking-wider text-mint-ink flex items-center gap-2 mb-2">
              <Icon name="tips_and_updates" size={18} />
              Tip
            </h2>
            <p className="font-body-sm text-body-sm text-mint-ink leading-relaxed">
              Write posts in MDX. Fenced code blocks are highlighted with Shiki and
              wrapped in the terminal window automatically — the editor preview shows
              exactly what readers will see.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
