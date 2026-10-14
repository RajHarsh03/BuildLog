import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { projectInputSchema } from "@/schemas/project";
import { deleteProject, getProjectById, updateProject } from "@/lib/content/projects";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

/** GET /api/projects/:id — a single project (any status). */
export async function GET(_request: Request, { params }: Context) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const project = await getProjectById(id);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ project });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

/** PATCH /api/projects/:id — partial update. */
export async function PATCH(request: Request, { params }: Context) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await request.json();
    const parsed = projectInputSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const project = await updateProject(id, parsed.data);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ project });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update project";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** DELETE /api/projects/:id */
export async function DELETE(_request: Request, { params }: Context) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const ok = await deleteProject(id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete project";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
