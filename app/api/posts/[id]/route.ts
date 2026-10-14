import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { postInputSchema } from "@/schemas/post";
import { deletePost, getPostById, updatePost } from "@/lib/content/posts";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

/** GET /api/posts/:id — a single post (any status). */
export async function GET(_request: Request, { params }: Context) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const post = await getPostById(id);
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

/** PATCH /api/posts/:id — partial update (status, featured, fields…). */
export async function PATCH(request: Request, { params }: Context) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await request.json();
    const parsed = postInputSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const post = await updatePost(id, parsed.data);
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ post });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** DELETE /api/posts/:id */
export async function DELETE(_request: Request, { params }: Context) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const ok = await deletePost(id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
