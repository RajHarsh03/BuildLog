import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/shared/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PostForm } from "@/components/admin/PostForm";
import { getPostById } from "@/lib/content/posts";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export const metadata = { title: "Edit post" };

export default async function EditPostPage({ params }: { params: Params }) {
  const { id } = await params;
  const post = await getPostById(id).catch(() => null);
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="min-w-0">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 font-mono-code text-mono-code text-on-surface-variant mb-2"
          >
            <Link className="hover:text-primary transition-colors" href="/admin/posts">
              Posts
            </Link>
            <span className="text-outline">/</span>
            <span className="text-on-surface font-semibold truncate">Edit</span>
          </nav>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-semibold tracking-tight flex items-center gap-3">
            <Icon name="edit_note" size={28} />
            <span className="truncate">{post.title}</span>
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <StatusBadge status={post.status} pulse={false} />
            <span className="font-mono-code text-label-sm text-on-surface-variant">
              /{post.slug}
            </span>
          </div>
        </div>

        {post.status === "published" && (
          <Link
            href={`/articles/${post.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface-container-lowest text-on-surface font-mono-code text-label-sm font-bold uppercase tracking-wider rounded border-2 border-on-surface shadow-[3px_3px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_var(--color-ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all self-start"
          >
            <Icon name="open_in_new" size={16} />
            View live
          </Link>
        )}
      </div>

      <PostForm post={post} />
    </div>
  );
}
