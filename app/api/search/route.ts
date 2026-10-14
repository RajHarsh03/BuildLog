import { NextResponse } from "next/server";
import { getPublishedPosts } from "@/lib/content/posts";
import { searchProjects } from "@/lib/content/projects";

export const dynamic = "force-dynamic";

/**
 * GET /api/search?q= — public command-palette search.
 * Returns a small set of published posts and projects matching the query.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();

  if (!q) {
    return NextResponse.json({ posts: [], projects: [] });
  }

  try {
    const [{ posts }, projects] = await Promise.all([
      getPublishedPosts({ q, perPage: 5 }),
      searchProjects(q, 5),
    ]);
    return NextResponse.json({ posts, projects });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed";
    return NextResponse.json({ error: message, posts: [], projects: [] }, { status: 500 });
  }
}
