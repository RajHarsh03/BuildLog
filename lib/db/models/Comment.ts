import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";
import type { Comment } from "@/types/comment";

export interface IComment {
  postId: string;
  parentId: string | null;
  body: string;
  authorName: string;
  authorEmail?: string | null;
  authorImage?: string | null;
  authorLogin?: string | null;
  likedBy: string[];
  likedByNames: string[];
  createdAt: Date;
}

export type CommentDocument = HydratedDocument<IComment>;

const CommentSchema = new Schema<IComment>(
  {
    postId: { type: String, required: true, index: true },
    // null = top-level comment; otherwise the _id of the parent comment.
    parentId: { type: String, default: null, index: true },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    authorName: { type: String, required: true, trim: true },
    authorEmail: { type: String, trim: true, lowercase: true },
    authorImage: { type: String },
    authorLogin: { type: String, trim: true },
    // Emails of users who liked this comment; the count is derived from length.
    likedBy: { type: [String], default: [] },
    // Display names shown publicly as "Liked by …".
    likedByNames: { type: [String], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

/**
 * Plain JSON-safe view. `likedBy` emails are never leaked — instead we expose a
 * derived `likes` count and a per-viewer `likedByMe` flag when an email is given.
 */
export function serializeComment(
  doc: CommentDocument | (IComment & { _id: unknown }),
  viewerEmail?: string | null,
): Comment {
  const obj = (
    typeof (doc as CommentDocument).toObject === "function"
      ? (doc as CommentDocument).toObject({ virtuals: false })
      : doc
  ) as IComment & { _id: unknown };
  const likedBy = obj.likedBy ?? [];
  return {
    _id: String(obj._id),
    postId: obj.postId,
    parentId: obj.parentId ?? null,
    body: obj.body,
    authorName: obj.authorName,
    authorEmail: obj.authorEmail ?? null,
    authorImage: obj.authorImage ?? null,
    authorLogin: obj.authorLogin ?? null,
    likes: likedBy.length,
    likedByMe: viewerEmail ? likedBy.includes(viewerEmail) : false,
    likedByNames: obj.likedByNames ?? [],
    createdAt: new Date(obj.createdAt).toISOString(),
  };
}

export const CommentModel: Model<IComment> =
  (mongoose.models.Comment as Model<IComment>) ||
  mongoose.model<IComment>("Comment", CommentSchema);
