import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { createComment, listComments } from "@/lib/content/comments";

export const dynamic = "force-dynamic";

const postCommentSchema = z.object({
  postId: z.string().min(1),
  body: z.string().trim().min(2, "Comment is too short").max(2000, "Comment is too long"),
  parentId: z.string().nullish(),
});

/** Per-user posting cooldown (best-effort in serverless; keeps drive-by spam low). */
const COOLDOWN_MS = 60_000;
const lastPostAt = new Map<string, number>();

/**
 * Best-effort GitHub username for the commenter: the JWT carries it after a
 * fresh sign-in; older JWTs lack it, so fall back to resolving the numeric id
 * embedded in the avatar URL via GitHub's public API (one call per comment).
 */
async function resolveGithubLogin(user: {
  githubLogin?: string;
  image?: string | null;
}): Promise<string | null> {
  if (user.githubLogin) return user.githubLogin;
  const m = user.image?.match(/avatars\.githubusercontent\.com\/u\/(\d+)/);
  if (!m) return null;
  try {
    const res = await fetch(`https://api.github.com/user/${m[1]}`, {
      headers: { "user-agent": "BuildLog" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { login?: unknown };
    return typeof json.login === "string" ? json.login : null;
  } catch {
    return null;
  }
}

/** GET /api/comments?postId=... — public, newest-first list for one post. */
export async function GET(request: Request) {
  const postId = new URL(request.url).searchParams.get("postId");
  if (!postId) {
    return NextResponse.json({ error: "postId is required" }, { status: 400 });
  }
  try {
    const session = await auth();
    const comments = await listComments(postId, session?.user?.email ?? null);
    return NextResponse.json({ comments });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load comments";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** POST /api/comments — requires any GitHub-signed-in reader. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in with GitHub to comment" }, { status: 401 });
  }

  const parsed = postCommentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 },
    );
  }

  const userId = session.user.email ?? session.user.name ?? "anon";
  const key = `${userId}:${parsed.data.postId}`;
  // The site owner (ADMIN_EMAIL) is exempt from the reader cooldown — otherwise
  // replying to a comment they just posted gets silently blocked for 60s.
  const ownerEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const isOwner = Boolean(ownerEmail && session.user.email?.toLowerCase() === ownerEmail);
  const last = lastPostAt.get(key) ?? 0;
  if (!isOwner && Date.now() - last < COOLDOWN_MS) {
    const wait = Math.ceil((COOLDOWN_MS - (Date.now() - last)) / 1000);
    return NextResponse.json(
      { error: `Hold on — try again in ${wait}s` },
      { status: 429 },
    );
  }

  try {
    const comment = await createComment(
      parsed.data.postId,
      parsed.data.body,
      {
        name: session.user.name ?? "Anonymous",
        email: session.user.email ?? null,
        image: session.user.image ?? null,
        login: await resolveGithubLogin(session.user),
      },
      parsed.data.parentId ?? null,
    );
    if (!isOwner) lastPostAt.set(key, Date.now());
    return NextResponse.json({ comment }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to post comment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
