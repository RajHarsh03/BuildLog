import computeReadingTime from "reading-time";
import { Types } from "mongoose";
import { revalidateTag, unstable_cache } from "next/cache";
import { dbConnect } from "@/lib/db/mongodb";
import { PostModel, serializePost, type IPost } from "@/lib/db/models/Post";
import type { Post, PostSummary } from "@/types/post";
import type { PostInput } from "@/schemas/post";
import { slugify } from "@/lib/utils";
import { clearFeaturedExcept } from "@/lib/content/featured";

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
async function getPublishedPostsUncached(query: PostQuery = {}) {
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

// Public reads are cached across requests and invalidated instantly when any
// post mutation calls revalidateTag("posts").
export const getPublishedPosts = unstable_cache(getPublishedPostsUncached, ["getPublishedPosts"], {
  tags: ["posts"],
  revalidate: 300,
});

async function getPostBySlugUncached(slug: string): Promise<Post | null> {
  await dbConnect();
  const doc = await PostModel.findOne({ slug, status: "published" }).lean();
  return doc ? serializePost(doc as never) : null;
}

export const getPostBySlug = unstable_cache(getPostBySlugUncached, ["getPostBySlug"], {
  tags: ["posts"],
  revalidate: 300,
});

/** Any status — used by admin + preview. */
export async function getPostBySlugAny(slug: string): Promise<Post | null> {
  await dbConnect();
  const doc = await PostModel.findOne({ slug }).lean();
  return doc ? serializePost(doc as never) : null;
}

/** All published slugs — used to prerender article pages at build time. */
export async function getPublishedSlugs(): Promise<string[]> {
  await dbConnect();
  const docs = await PostModel.find({ status: "published" }).select("slug").lean();
  return docs.map((d) => d.slug);
}

export async function getPostById(id: string): Promise<Post | null> {
  await dbConnect();
  const doc = await PostModel.findById(id).lean();
  return doc ? serializePost(doc as never) : null;
}

async function getLatestPostsUncached(limit = 3): Promise<PostSummary[]> {
  await dbConnect();
  const docs = await PostModel.find({ status: "published" })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean();
  return docs.map((d) => toSummary(serializePost(d as never)));
}

export const getLatestPosts = unstable_cache(getLatestPostsUncached, ["getLatestPosts"], {
  tags: ["posts"],
  revalidate: 300,
});

async function getFeaturedPostUncached(): Promise<PostSummary | null> {
  await dbConnect();
  // The starred post wins regardless of recency; drafts never surface publicly.
  const doc =
    (await PostModel.findOne({ status: "published", featured: true })
      .sort({ publishedAt: -1 })
      .lean()) ||
    (await PostModel.findOne({ status: "published" }).sort({ publishedAt: -1 }).lean());
  return doc ? toSummary(serializePost(doc as never)) : null;
}

export const getFeaturedPost = unstable_cache(getFeaturedPostUncached, ["getFeaturedPost"], {
  tags: ["posts"],
  revalidate: 300,
});

async function getRelatedPostsUncached(
  excludeId: string,
  category: string,
  tags: string[],
  limit: number,
): Promise<PostSummary[]> {
  await dbConnect();
  const exclude = new Types.ObjectId(excludeId);
  // Random pick from same category/tags first...
  const matched = await PostModel.aggregate<IPost & { _id: Types.ObjectId }>([
    {
      $match: {
        status: "published",
        _id: { $ne: exclude },
        $or: [{ category }, { tags: { $in: tags } }],
      },
    },
    { $sample: { size: limit } },
  ]);
  // ...then top up with random posts from the rest of the journal, so the
  // "More From The Journal" row is always full.
  let docs: (IPost & { _id: Types.ObjectId })[] = matched;
  if (matched.length < limit) {
    const taken = matched.map((m) => m._id);
    const fill = await PostModel.aggregate<IPost & { _id: Types.ObjectId }>([
      { $match: { status: "published", _id: { $nin: [exclude, ...taken] } } },
      { $sample: { size: limit - matched.length } },
    ]);
    docs = [...matched, ...fill];
  }
  return docs.map((d) => toSummary(serializePost(d as never)));
}

const getRelatedPostsCached = unstable_cache(getRelatedPostsUncached, ["getRelatedPosts"], {
  tags: ["posts"],
  revalidate: 300,
});

export function getRelatedPosts(post: Post, limit = 3): Promise<PostSummary[]> {
  return getRelatedPostsCached(String(post._id), post.category, post.tags, limit);
}

async function getAdjacentPostsUncached(
  publishedAt: string | null,
  createdAt: string,
): Promise<{ prev: PostSummary | null; next: PostSummary | null }> {
  await dbConnect();
  const base = publishedAt ? new Date(publishedAt) : new Date(createdAt);
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

const getAdjacentPostsCached = unstable_cache(getAdjacentPostsUncached, ["getAdjacentPosts"], {
  tags: ["posts"],
  revalidate: 300,
});

export function getAdjacentPosts(post: Post): Promise<{
  prev: PostSummary | null;
  next: PostSummary | null;
}> {
  return getAdjacentPostsCached(
    post.publishedAt ? String(post.publishedAt) : null,
    String(post.createdAt),
  );
}

async function getCategoriesUncached(): Promise<{ name: string; count: number }[]> {
  await dbConnect();
  const rows = await PostModel.aggregate<{ _id: string; count: number }>([
    { $match: { status: "published" } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  return rows.map((r) => ({ name: r._id, count: r.count }));
}

export const getCategories = unstable_cache(getCategoriesUncached, ["getCategories"], {
  tags: ["posts"],
  revalidate: 300,
});

async function getTagsUncached(): Promise<{ name: string; count: number }[]> {
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

export const getTags = unstable_cache(getTagsUncached, ["getTags"], {
  tags: ["posts"],
  revalidate: 300,
});

/** Admin: all posts regardless of status, featured first then newest. */
export async function getAllPostsAdmin(): Promise<PostSummary[]> {
  await dbConnect();
  const docs = await PostModel.find({}).sort({ featured: -1, updatedAt: -1 }).lean();
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
  // Only one post can be featured at a time.
  if (input.featured === true) {
    await clearFeaturedExcept("post", String(doc._id));
  }
  revalidateTag("posts");
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
  // Only one post can be featured at a time.
  if (input.featured === true) {
    await clearFeaturedExcept("post", id);
  }
  revalidateTag("posts");
  return doc ? serializePost(doc) : null;
}

export async function deletePost(id: string): Promise<boolean> {
  await dbConnect();
  const res = await PostModel.findByIdAndDelete(id);
  revalidateTag("posts");
  return Boolean(res);
}
