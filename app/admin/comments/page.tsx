import { auth } from "@/lib/auth/auth";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { AdminComments, type CommentGroup } from "@/components/admin/AdminComments";
import { getAllPostsAdmin } from "@/lib/content/posts";
import { getAllCommentsAdmin } from "@/lib/content/comments";

export const dynamic = "force-dynamic";

export const metadata = { title: "Comments" };

export default async function AdminCommentsPage() {
  const session = await auth();
  const [posts, comments] = await Promise.all([
    getAllPostsAdmin().catch(() => []),
    getAllCommentsAdmin(session?.user?.email ?? null).catch(() => []),
  ]);

  // Group comments under their post, newest-activity post first.
  const byPost = new Map<string, CommentGroup>();
  for (const post of posts) {
    byPost.set(post._id, { postId: post._id, postTitle: post.title, postSlug: post.slug, comments: [] });
  }
  for (const c of comments) {
    const group = byPost.get(c.postId);
    if (group) group.comments.push(c);
  }

  const groups = [...byPost.values()]
    .filter((g) => g.comments.length > 0)
    .sort(
      (a, b) =>
        Math.max(...b.comments.map((c) => Date.parse(c.createdAt))) -
        Math.max(...a.comments.map((c) => Date.parse(c.createdAt))),
    );

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

      <AdminComments groups={groups} />
    </div>
  );
}
