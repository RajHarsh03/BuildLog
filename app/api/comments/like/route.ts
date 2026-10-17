import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guard";
import { addLike } from "@/lib/content/comments";

export const dynamic = "force-dynamic";

const schema = z.object({ commentId: z.string().min(1) });

/**
 * POST /api/comments/like — one-way like, restricted to the site owner
 * (ADMIN_EMAIL allowlist via requireAdmin). No unlike endpoint exists.
 */
export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session?.user) {
    return NextResponse.json({ error: "Only the site owner can like comments" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const comment = await addLike(
      parsed.data.commentId,
      (session.user.email ?? session.user.name ?? "owner").toLowerCase(),
      session.user.name ?? "Harsh",
    );
    if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ comment });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update like";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
