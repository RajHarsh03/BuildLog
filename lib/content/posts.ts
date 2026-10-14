import computeReadingTime from "reading-time";
import { dbConnect } from "@/lib/db/mongodb";
import { PostModel, serializePost, type IPost } from "@/lib/db/models/Post";
import type { Post, PostSummary } from "@/types/post";
import type { PostInput } from "@/schemas/post";
import { slugify } from "@/lib/utils";

export const POSTS_PER_PAGE = 9;

function toSummary(post: Post): PostSummary {
  const { content: _content, ...rest } = post;
  return rest;
}

/** Ensure a slug is unique by appending -2, -3, ... when needed. */
async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  let slug = slugify(base) || "post";
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await PostModel.findOne({ slug }).lean();
    if (!existing || String(existing._id) === ignoreId) return slug;
    n += 1;
    slug = `${slugify(base)}-${n}`;
  }
}

export interface PostQuery {
  q?: string;
  category?: string;
  tag?: string;
  sort?: "newest" | "oldest" | "popular";
  page?: number;
  perPage?: number;
}

/** Published posts with optional search/filter/sort/pagination. */
export async function getPublishedPosts(query: PostQuery = {}) {
  await dbConnect();
  const { q, category, tag, sort = "newest", page = 1, perPage = POSTS_PER_PAGE } = query;

  const filter: Record<string, unknown> = { status: "published" };
  if (category && category !== "all") filter.category = category;
  if (tag) filter.tags = tag;
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { excerpt: { $regex: q, $options: "i" } },
      { tags: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } },
    ];
  }

  const sortSpec: Record<string, 1 | -1> =
    sort === "oldest"
      ? { publishedAt: 1 }
      : sort === "popular"
        ? { readingTime: -1, publishedAt: -1 }
        : { publishedAt: -1 };

  const skip = (Math.max(1, page) - 1) * perPage;
  const [docs, total] = await Promise.all([
    PostModel.find(filter).sort(sortSpec).skip(skip).limit(perPage).lean(),
    PostModel.countDocuments(filter),
  ]);

  const posts: PostSummary[] = docs.map((d) => toSummary(serializePost(d as never)));
  return {
    posts,
    total,
    page: Math.max(1, page),
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  await dbConnect();
  const doc = await PostModel.findOne({ slug, status: "published" }).lean();
  return doc ? serializePost(doc as never) : null;
}

/** Any status — used by admin + preview. */
export async function getPostBySlugAny(slug: string): Promise<Post | null> {
  await dbConnect();
  const doc = await PostModel.findOne({ slug }).lean();
  return doc ? serializePost(doc as never) : null;
}

export async function getPostById(id: string): Promise<Post | null> {
  await dbConnect();
  const doc = await PostModel.findById(id).lean();
  return doc ? serializePost(doc as never) : null;
}

export async function getLatestPosts(limit = 3): Promise<PostSummary[]> {
  await dbConnect();
  const docs = await PostModel.find({ status: "published" })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean();
  return docs.map((d) => toSummary(serializePost(d as never)));
}

export async function getFeaturedPost(): Promise<PostSummary | null> {
  await dbConnect();
  const doc =
    (await PostModel.findOne({ status: "published", featured: true })
      .sort({ publishedAt: -1 })
      .lean()) ||
    (await PostModel.findOne({ status: "published" }).sort({ publishedAt: -1 }).lean());
  return doc ? toSummary(serializePost(doc as never)) : null;
}

export async function getRelatedPosts(post: Post, limit = 3): Promise<PostSummary[]> {
  await dbConnect();
  const docs = await PostModel.find({
    status: "published",
    _id: { $ne: post._id },
    $or: [{ category: post.category }, { tags: { $in: post.tags } }],
  })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean();
  return docs.map((d) => toSummary(serializePost(d as never)));
}

export async function getAdjacentPosts(post: Post): Promise<{
  prev: PostSummary | null;
  next: PostSummary | null;
}> {
  await dbConnect();
  const base = post.publishedAt ? new Date(post.publishedAt) : new Date(post.createdAt);
  const [prev, next] = await Promise.all([
    PostModel.findOne({ status: "published", publishedAt: { $lt: base } })
      .sort({ publishedAt: -1 })
      .lean(),
    PostModel.findOne({ status: "published", publishedAt: { $gt: base } })
      .sort({ publishedAt: 1 })
      .lean(),
  ]);
  return {
    prev: prev ? toSummary(serializePost(prev as never)) : null,
    next: next ? toSummary(serializePost(next as never)) : null,
  };
}

export async function getCategories(): Promise<{ name: string; count: number }[]> {
  await dbConnect();
  const rows = await PostModel.aggregate<{ _id: string; count: number }>([
    { $match: { status: "published" } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  return rows.map((r) => ({ name: r._id, count: r.count }));
}

export async function getTags(): Promise<{ name: string; count: number }[]> {
  await dbConnect();
  const rows = await PostModel.aggregate<{ _id: string; count: number }>([
    { $match: { status: "published" } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 24 },
  ]);
  return rows.map((r) => ({ name: r._id, count: r.count }));
}

/** Admin: all posts regardless of status, newest first. */
export async function getAllPostsAdmin(): Promise<PostSummary[]> {
  await dbConnect();
  const docs = await PostModel.find({}).sort({ updatedAt: -1 }).lean();
  return docs.map((d) => toSummary(serializePost(d as never)));
}

export async function getPostStats() {
  await dbConnect();
  const [total, published, drafts] = await Promise.all([
    PostModel.countDocuments({}),
    PostModel.countDocuments({ status: "published" }),
    PostModel.countDocuments({ status: "draft" }),
  ]);
  return { total, published, drafts };
}

export async function createPost(input: PostInput): Promise<Post> {
  await dbConnect();
  const slug = await uniqueSlug(input.title);
  const readingTime = Math.max(1, Math.round(computeReadingTime(input.content || "").minutes));
  const doc = await PostModel.create({
    ...input,
    slug,
    readingTime,
    publishedAt: input.status === "published" ? new Date() : undefined,
  } as Partial<IPost>);
  return serializePost(doc);
}

export async function updatePost(id: string, input: Partial<PostInput>): Promise<Post | null> {
  await dbConnect();
  const current = await PostModel.findById(id);
  if (!current) return null;

  const patch: Partial<IPost> = { ...input } as Partial<IPost>;
  if (input.title && input.title !== current.title) {
    patch.slug = await uniqueSlug(input.title, id);
  }
  if (typeof input.content === "string") {
    patch.readingTime = Math.max(1, Math.round(computeReadingTime(input.content).minutes));
  }
  if (input.status === "published" && current.status !== "published") {
    patch.publishedAt = new Date();
  }
  const doc = await PostModel.findByIdAndUpdate(id, patch, { new: true });
  return doc ? serializePost(doc) : null;
}

export async function deletePost(id: string): Promise<boolean> {
  await dbConnect();
  const res = await PostModel.findByIdAndDelete(id);
  return Boolean(res);
}
