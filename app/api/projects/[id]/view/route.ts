import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { getProjectViews, incrementProjectViews } from "@/lib/content/projects";

export const dynamic = "force-dynamic";

/** GET /api/projects/:id/view - current count only, never increments. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
  }
  try {
    const views = await getProjectViews(id);
    if (views === null) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({ views });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to read views";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** POST /api/projects/:id/view - count one page view, return the fresh total. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
  }
  try {
    const views = await incrementProjectViews(id);
    if (views === null) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({ views });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to record view";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
