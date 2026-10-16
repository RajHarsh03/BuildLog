import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";
import type { Post, PostStatus } from "@/types/post";

export interface IPost {
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
  views: number;
  publishedAt?: Date;
  seoTitle?: string;
  seoDescription?: string;
  seoImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PostDocument = HydratedDocument<IPost>;

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    coverImage: { type: String },
    category: { type: String, required: true, index: true },
    tags: { type: [String], default: [], index: true },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    featured: { type: Boolean, default: false },
    readingTime: { type: Number, default: 1 },
    views: { type: Number, default: 0, min: 0 },
    publishedAt: { type: Date, index: true },
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoImage: { type: String },
  },
  { timestamps: true },
);

PostSchema.index({ title: "text", excerpt: "text", content: "text", tags: "text" });

/**
 * Convert a Mongoose document, or a `.lean()` plain object, into a plain
 * JSON-safe Post object. Read paths use `.lean()`, so `toObject` is absent.
 */
export function serializePost(doc: PostDocument | IPost & { _id: unknown }): Post {
  const obj = (
    typeof (doc as PostDocument).toObject === "function"
      ? (doc as PostDocument).toObject({ virtuals: false })
      : doc
  ) as IPost & { _id: unknown };
  return {
    _id: String(obj._id),
    title: obj.title,
    slug: obj.slug,
    excerpt: obj.excerpt ?? "",
    content: obj.content ?? "",
    coverImage: obj.coverImage,
    category: obj.category,
    tags: obj.tags ?? [],
    status: obj.status,
    featured: obj.featured ?? false,
    readingTime: obj.readingTime ?? 1,
    views: obj.views ?? 0,
    publishedAt: obj.publishedAt ? new Date(obj.publishedAt).toISOString() : undefined,
    createdAt: new Date(obj.createdAt).toISOString(),
    updatedAt: new Date(obj.updatedAt).toISOString(),
    seoTitle: obj.seoTitle,
    seoDescription: obj.seoDescription,
    seoImage: obj.seoImage,
  };
}

export const PostModel: Model<IPost> =
  (mongoose.models.Post as Model<IPost>) ||
  mongoose.model<IPost>("Post", PostSchema);
