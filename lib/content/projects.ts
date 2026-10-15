import { dbConnect } from "@/lib/db/mongodb";
import { ProjectModel, serializeProject, type IProject } from "@/lib/db/models/Project";
import type { Project, ProjectSummary, ProjectStatus } from "@/types/project";
import type { ProjectInput } from "@/schemas/project";
import { slugify } from "@/lib/utils";
import { clearFeaturedExcept } from "@/lib/content/featured";

function toSummary(project: Project): ProjectSummary {
  const { content: _content, ...rest } = project;
  return rest;
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  let slug = slugify(base) || "project";
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await ProjectModel.findOne({ slug }).lean();
    if (!existing || String(existing._id) === ignoreId) return slug;
    n += 1;
    slug = `${slugify(base)}-${n}`;
  }
}

export async function getProjects(status?: ProjectStatus | "all"): Promise<ProjectSummary[]> {
  await dbConnect();
  const filter = status && status !== "all" ? { status } : {};
  const docs = await ProjectModel.find(filter)
    .sort({ featured: -1, updatedAt: -1 })
    .lean();
  return docs.map((d) => toSummary(serializeProject(d as never)));
}

/** Public search across projects by name, description or technology. */
export async function searchProjects(q: string, limit = 5): Promise<ProjectSummary[]> {
  await dbConnect();
  const term = q.trim();
  if (!term) return [];
  const docs = await ProjectModel.find({
    $or: [
      { name: { $regex: term, $options: "i" } },
      { description: { $regex: term, $options: "i" } },
      { technologies: { $regex: term, $options: "i" } },
    ],
  })
    .sort({ featured: -1, updatedAt: -1 })
    .limit(limit)
    .lean();
  return docs.map((d) => toSummary(serializeProject(d as never)));
}

export async function getFeaturedProject(): Promise<ProjectSummary | null> {
  await dbConnect();
  // The starred project wins regardless of status (spotlight follows the star);
  // otherwise fall back to the most recently updated active project.
  const doc =
    (await ProjectModel.findOne({ featured: true })
      .sort({ updatedAt: -1 })
      .lean()) || (await ProjectModel.findOne({ status: "active" }).sort({ updatedAt: -1 }).lean());
  return doc ? toSummary(serializeProject(doc as never)) : null;
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  await dbConnect();
  const doc = await ProjectModel.findOne({ slug }).lean();
  return doc ? serializeProject(doc as never) : null;
}

export async function getProjectById(id: string): Promise<Project | null> {
  await dbConnect();
  const doc = await ProjectModel.findById(id).lean();
  return doc ? serializeProject(doc as never) : null;
}

export async function getAllProjectsAdmin(): Promise<ProjectSummary[]> {
  await dbConnect();
  const docs = await ProjectModel.find({}).sort({ featured: -1, updatedAt: -1 }).lean();
  return docs.map((d) => toSummary(serializeProject(d as never)));
}

export async function getProjectStatusCounts(): Promise<Record<string, number>> {
  await dbConnect();
  const rows = await ProjectModel.aggregate<{ _id: string; count: number }>([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const counts: Record<string, number> = { all: 0, active: 0, shipped: 0, archived: 0 };
  for (const r of rows) {
    counts[r._id] = r.count;
    counts.all += r.count;
  }
  return counts;
}

export async function createProject(input: ProjectInput): Promise<Project> {
  await dbConnect();
  const slug = await uniqueSlug(input.name);
  const doc = await ProjectModel.create({ ...input, slug } as Partial<IProject>);
  // Only one project can be featured at a time.
  if (input.featured) {
    await clearFeaturedExcept("project", String(doc._id));
  }
  return serializeProject(doc);
}

export async function updateProject(
  id: string,
  input: Partial<ProjectInput>,
): Promise<Project | null> {
  await dbConnect();
  const current = await ProjectModel.findById(id);
  if (!current) return null;
  const patch: Partial<IProject> = { ...input } as Partial<IProject>;
  if (input.name && input.name !== current.name) {
    patch.slug = await uniqueSlug(input.name, id);
  }
  const doc = await ProjectModel.findByIdAndUpdate(id, patch, { new: true });
  // Only one project can be featured at a time.
  if (input.featured === true) {
    await clearFeaturedExcept("project", id);
  }
  return doc ? serializeProject(doc) : null;
}

export async function deleteProject(id: string): Promise<boolean> {
  await dbConnect();
  const res = await ProjectModel.findByIdAndDelete(id);
  return Boolean(res);
}
