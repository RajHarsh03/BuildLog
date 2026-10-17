import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/shared/Icon";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
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
          <Breadcrumbs
            className="mb-2"
            homeLabel="Dashboard"
            homeHref="/admin"
            items={[{ label: "Posts", href: "/admin/posts" }, { label: "Edit" }]}
          />
          <h1 className="font-headline-lg text-[20px] leading-snug sm:text-headline-lg-mobile md:text-headline-lg text-on-surface font-semibold tracking-tight flex items-center gap-2 sm:gap-3">
            <Icon name="edit_note" className="shrink-0 text-[26px]! sm:text-[36px]!" />
            <span className="min-w-0 truncate sm:max-w-[30rem] md:max-w-[36rem]">{post.title}</span>
          </h1>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <span className="block font-mono-code text-[10px] sm:text-label-sm text-on-surface-variant break-all order-1 sm:order-2">
              /{post.slug}
            </span>
            <div className="flex items-center justify-between gap-2 sm:w-auto order-2 sm:order-1">
              <StatusBadge
                status={post.status}
                pulse={false}
                className="px-1.5 py-0.5 text-[9px] gap-1 sm:px-2.5 sm:py-1 sm:text-label-sm sm:gap-1.5"
              />
              {post.status === "published" && (
                <Link
                  href={`/articles/${post.slug}`}
                  target="_blank"
                  className="sm:hidden inline-flex items-center gap-1 px-2 py-1 bg-surface-container-lowest text-on-surface font-mono-code text-[9px] font-bold uppercase tracking-wider rounded border-2 border-on-surface shadow-[2px_2px_0px_0px_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all whitespace-nowrap"
                >
                  <Icon name="open_in_new" size={13} />
                  View live
                </Link>
              )}
            </div>
          </div>
        </div>

        {post.status === "published" && (
          <Link
            href={`/articles/${post.slug}`}
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 shrink-0 bg-surface-container-lowest text-on-surface font-mono-code text-label-sm font-bold uppercase tracking-wider rounded border-2 border-on-surface shadow-[3px_3px_0px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_var(--color-ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all self-start whitespace-nowrap"
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
