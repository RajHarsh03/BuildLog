import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { aboutInputSchema } from "@/schemas/about";
import { getAboutContent, updateAboutContent } from "@/lib/content/about";

export const dynamic = "force-dynamic";

/** GET /api/about — current editable About document (admin). */
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const about = await getAboutContent();
    return NextResponse.json({ about });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load about content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** PATCH /api/about — replace the About document (intro, journey, skills). */
export async function PATCH(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const parsed = aboutInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const about = await updateAboutContent(parsed.data);
    return NextResponse.json({ about });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save about content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
