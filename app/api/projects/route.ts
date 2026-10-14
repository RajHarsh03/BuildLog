import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { projectInputSchema } from "@/schemas/project";
import { createProject, getAllProjectsAdmin } from "@/lib/content/projects";

export const dynamic = "force-dynamic";

/** GET /api/projects — list every project (all statuses) for the admin. */
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const projects = await getAllProjectsAdmin();
    return NextResponse.json({ projects });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load projects";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** POST /api/projects — create a project. Slug is derived server-side. */
export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const parsed = projectInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const project = await createProject(parsed.data);
    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create project";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
