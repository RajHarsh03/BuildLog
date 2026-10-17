import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guard";
import { deleteComment, updateComment } from "@/lib/content/comments";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

const editSchema = z.object({ body: z.string().trim().min(2).max(2000) });

/** DELETE /api/comments/:id — admin-only; cascades to direct replies. */
export async function DELETE(_request: Request, { params }: Context) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deleteComment(id);
  return NextResponse.json({ ok: true });
}

/** PATCH /api/comments/:id — admin-only body edit. */
export async function PATCH(request: Request, { params }: Context) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = editSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { id } = await params;
  const comment = await updateComment(id, parsed.data.body, session.user?.email ?? undefined);
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ comment });
}
