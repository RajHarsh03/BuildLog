import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { postInputSchema } from "@/schemas/post";
import { createPost, getAllPostsAdmin } from "@/lib/content/posts";

export const dynamic = "force-dynamic";

/** GET /api/posts — list every post (all statuses) for the admin. */
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const posts = await getAllPostsAdmin();
    return NextResponse.json({ posts });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load posts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** POST /api/posts — create a post. Slug + readingTime are derived server-side. */
export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const parsed = postInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const post = await createPost(parsed.data);
    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
