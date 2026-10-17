import { Icon } from "@/components/shared/Icon";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PostForm } from "@/components/admin/PostForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "New post" };

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs
          className="mb-2"
          homeLabel="Dashboard"
          homeHref="/admin"
          items={[{ label: "Posts", href: "/admin/posts" }, { label: "New" }]}
        />
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-semibold tracking-tight flex items-center gap-2">
          <Icon name="edit_note" size={28} />
          New post
        </h1>
      </div>

      <PostForm />
    </div>
  );
}
