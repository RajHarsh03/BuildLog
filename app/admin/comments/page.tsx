import { auth } from "@/lib/auth/auth";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import type { CommentGroup } from "@/components/admin/AdminComments";
import { CommentsBrowser } from "@/components/admin/CommentsBrowser";
import { getAllPostsAdmin } from "@/lib/content/posts";
import { getAllProjectsAdmin } from "@/lib/content/projects";
import { getAllCommentsAdmin } from "@/lib/content/comments";

export const dynamic = "force-dynamic";

export const metadata = { title: "Comments" };

export default async function AdminCommentsPage() {
  const session = await auth();
  const [posts, projects, comments] = await Promise.all([
    getAllPostsAdmin().catch(() => []),
    getAllProjectsAdmin().catch(() => []),
    getAllCommentsAdmin(session?.user?.email ?? null).catch(() => []),
  ]);

  // Group comments under their post or project, newest-activity entry first.
  const projectIds = new Set(projects.map((p) => p._id));
  const byPost = new Map<string, CommentGroup>();
  for (const post of posts) {
    byPost.set(post._id, { postId: post._id, postTitle: post.title, postSlug: post.slug, comments: [] });
  }
  for (const project of projects) {
    byPost.set(project._id, {
      postId: project._id,
      postTitle: project.name,
      postSlug: project.slug,
      postHref: `/projects/${project.slug}`,
      comments: [],
    });
  }
  for (const c of comments) {
    const group = byPost.get(c.postId);
    if (group) group.comments.push(c);
  }

  const byActivity = (a: CommentGroup, b: CommentGroup) =>
    Math.max(...b.comments.map((c) => Date.parse(c.createdAt))) -
    Math.max(...a.comments.map((c) => Date.parse(c.createdAt)));

  const withComments = [...byPost.values()].filter((g) => g.comments.length > 0);
  const postGroups = withComments.filter((g) => !projectIds.has(g.postId)).sort(byActivity);
  const projectGroups = withComments.filter((g) => projectIds.has(g.postId)).sort(byActivity);

  const total = comments.length;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        homeLabel="Dashboard"
        homeHref="/admin"
        items={[{ label: "Comments" }]}
      />
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-semibold tracking-tight">
          Comments
        </h1>
        <span className="font-mono-code text-[11px] sm:text-label-sm text-on-surface-variant whitespace-nowrap">
          {total} total
        </span>
      </div>

      {/* All / Posts / Projects filter tabs drive one shared moderation list */}
      <CommentsBrowser postGroups={postGroups} projectGroups={projectGroups} />
    </div>
  );
}
