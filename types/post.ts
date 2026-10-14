export type PostStatus = "draft" | "published" | "archived";

/** Serialized post shape used across server components and the API. */
export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: string;
  tags: string[];
  status: PostStatus;
  featured: boolean;
  readingTime: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  seoTitle?: string;
  seoDescription?: string;
  seoImage?: string;
}

/** A trimmed post used for cards/lists (no body content). */
export type PostSummary = Omit<Post, "content">;

export interface TocItem {
  id: string;
  text: string;
  depth: number;
}
