import { revalidateTag } from "next/cache";
import { cached } from "@/lib/content/cached";
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

/** Statuses visible on the public site. `archived` is private, like post drafts. */
const PUBLIC_STATUSES: ProjectStatus[] = ["active", "shipped"];

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

async function getProjectsUncached(status?: ProjectStatus | "all"): Promise<ProjectSummary[]> {
  await dbConnect();
  // Archived projects never surface publicly, even when explicitly asked for.
  if (status === "archived") return [];
  const filter =
    status && status !== "all" ? { status } : { status: { $in: PUBLIC_STATUSES } };
  const docs = await ProjectModel.find(filter)
    .sort({ featured: -1, updatedAt: -1 })
    .lean();
  return docs.map((d) => toSummary(serializeProject(d as never)));
}

// Public reads are cached across requests; mutations call revalidateTag("projects").
export const getProjects = cached(getProjectsUncached, ["getProjects"], {
  tags: ["projects"],
  revalidate: 300,
});

/** Public search across projects by name, description or technology. */
export async function searchProjects(q: string, limit = 5): Promise<ProjectSummary[]> {
  await dbConnect();
  const term = q.trim();
  if (!term) return [];
  const docs = await ProjectModel.find({
    status: { $in: PUBLIC_STATUSES },
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

async function getFeaturedProjectUncached(): Promise<ProjectSummary | null> {
  await dbConnect();
  // The starred project wins regardless of ship status (spotlight follows the star);
  // otherwise fall back to the most recently updated active project.
  // Archived projects are excluded — a featured-but-archived build disappears publicly.
  const doc =
    (await ProjectModel.findOne({ featured: true, status: { $in: PUBLIC_STATUSES } })
      .sort({ updatedAt: -1 })
      .lean()) ||
    (await ProjectModel.findOne({ status: "active" }).sort({ updatedAt: -1 }).lean());
  return doc ? toSummary(serializeProject(doc as never)) : null;
}

export const getFeaturedProject = cached(
  getFeaturedProjectUncached,
  ["getFeaturedProject"],
  { tags: ["projects"], revalidate: 300 },
);

async function getProjectBySlugUncached(slug: string): Promise<Project | null> {
  await dbConnect();
  // Archived slugs 404 publicly (same contract as unpublished posts).
  const doc = await ProjectModel.findOne({ slug, status: { $in: PUBLIC_STATUSES } }).lean();
  return doc ? serializeProject(doc as never) : null;
}

export const getProjectBySlug = cached(getProjectBySlugUncached, ["getProjectBySlug"], {
  tags: ["projects"],
  revalidate: 300,
});

export async function getProjectById(id: string): Promise<Project | null> {
  await dbConnect();
  const doc = await ProjectModel.findById(id).lean();
  return doc ? serializeProject(doc as never) : null;
}

/** Public project slugs — used to prerender project pages at build time. */
export async function getAllProjectSlugs(): Promise<string[]> {
  await dbConnect();
  const docs = await ProjectModel.find({ status: { $in: PUBLIC_STATUSES } }).select("slug").lean();
  return docs.map((d) => d.slug);
}

export async function getAllProjectsAdmin(): Promise<ProjectSummary[]> {
  await dbConnect();
  // -content: case-study bodies are large and unused by admin lists.
  const docs = await ProjectModel.find({}).select("-content").sort({ featured: -1, updatedAt: -1 }).lean();
  return docs.map((d) => toSummary(serializeProject(d as never)));
}

async function getProjectStatusCountsUncached(): Promise<Record<string, number>> {
  await dbConnect();
  const rows = await ProjectModel.aggregate<{ _id: string; count: number }>([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const counts: Record<string, number> = { all: 0, active: 0, shipped: 0, archived: 0 };
  for (const r of rows) {
    counts[r._id] = r.count;
  }
  // Public "all" excludes archived.
  counts.all = counts.active + counts.shipped;
  return counts;
}

export const getProjectStatusCounts = cached(
  getProjectStatusCountsUncached,
  ["getProjectStatusCounts"],
  { tags: ["projects"], revalidate: 300 },
);

export async function createProject(input: ProjectInput): Promise<Project> {
  await dbConnect();
  const slug = await uniqueSlug(input.slug?.trim() || input.name);
  // Admin-chosen date back-dates publishedAt and createdAt together.
  const chosen = input.publishedAt ? new Date(input.publishedAt) : undefined;
  const doc = await ProjectModel.create({
    ...input,
    slug,
    publishedAt: chosen,
    ...(chosen ? { createdAt: chosen } : {}),
  } as Partial<IProject>);
  // Only one project can be featured at a time.
  if (input.featured) {
    await clearFeaturedExcept("project", String(doc._id));
  }
  revalidateTag("projects");
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
  // Slug resolution: explicit custom slug wins; otherwise a changed name
  // regenerates it; otherwise leave the stored slug untouched.
  const wantedSlug = input.slug?.trim();
  if (wantedSlug) {
    patch.slug = wantedSlug === current.slug ? current.slug : await uniqueSlug(wantedSlug, id);
  } else if (input.name && input.name !== current.name) {
    patch.slug = await uniqueSlug(input.name, id);
  } else {
    delete patch.slug;
  }
  if (input.publishedAt) {
    const d = new Date(input.publishedAt);
    patch.publishedAt = d;
    patch.createdAt = d;
  }
  const doc = await ProjectModel.findByIdAndUpdate(id, patch, { new: true });
  // Only one project can be featured at a time.
  if (input.featured === true) {
    await clearFeaturedExcept("project", id);
  }
  revalidateTag("projects");
  return doc ? serializeProject(doc) : null;
}

/** Read-only view count (no bump) - used for revisits inside the cooldown. */
export async function getProjectViews(id: string): Promise<number | null> {
  await dbConnect();
  const doc = await ProjectModel.findById(id).select("views").lean();
  return doc ? (doc.views ?? 0) : null;
}

/** Atomic per-visitor view bump; returns the fresh count. Deliberately does
 * NOT revalidate caches - mirrors incrementPostViews (see posts.ts). */
export async function incrementProjectViews(id: string): Promise<number | null> {
  await dbConnect();
  const doc = await ProjectModel.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { new: true, timestamps: false },
  ).lean();
  return doc ? (doc.views ?? 0) : null;
}

export async function deleteProject(id: string): Promise<boolean> {
  await dbConnect();
  const res = await ProjectModel.findByIdAndDelete(id);
  revalidateTag("projects");
  return Boolean(res);
}
