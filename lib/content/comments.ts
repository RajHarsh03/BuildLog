import { dbConnect } from "@/lib/db/mongodb";
import { CommentModel, serializeComment, type IComment } from "@/lib/db/models/Comment";
import type { Comment } from "@/types/comment";

export interface CommentAuthor {
  name: string;
  email?: string | null;
  image?: string | null;
  login?: string | null;
}

/** Newest-first comments for one post (capped; the UI paginates by "show more"). */
export async function listComments(postId: string, viewerEmail?: string | null): Promise<Comment[]> {
  await dbConnect();
  const docs = await CommentModel.find({ postId })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  return docs.map((d) => serializeComment(d as IComment & { _id: unknown }, viewerEmail));
}

export async function createComment(
  postId: string,
  body: string,
  author: CommentAuthor,
  parentId: string | null = null,
): Promise<Comment> {
  await dbConnect();
  const doc = await CommentModel.create({
    postId,
    parentId,
    body,
    authorName: author.name,
    authorEmail: author.email ?? null,
    authorImage: author.image ?? null,
    authorLogin: author.login ?? null,
    likedBy: [],
  });
  return serializeComment(doc, author.email ?? null);
}

/**
 * One-way like (owner-only, no unlike). Returns the fresh serialized comment,
 * `null` when the comment does not exist, or throws when already liked.
 */
export async function addLike(
  commentId: string,
  email: string,
  name: string,
): Promise<Comment | null> {
  await dbConnect();
  const doc = await CommentModel.findById(commentId).lean();
  if (!doc) return null;
  const likedBy: string[] = (doc as { likedBy?: string[] }).likedBy ?? [];
  if (likedBy.includes(email)) {
    throw new Error("This comment is already liked.");
  }
  const updated = await CommentModel.findByIdAndUpdate(
    commentId,
    { $addToSet: { likedBy: email, likedByNames: name } },
    { new: true },
  ).lean();
  return updated ? serializeComment(updated as IComment & { _id: unknown }, email) : null;
}

/** Every recent comment across all posts, for the admin moderation view. */
export async function getAllCommentsAdmin(viewerEmail?: string | null): Promise<Comment[]> {
  await dbConnect();
  const docs = await CommentModel.find({})
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();
  return docs.map((d) => serializeComment(d as IComment & { _id: unknown }, viewerEmail));
}

/** Admin moderation: remove a comment and any replies to it. */
export async function deleteComment(id: string): Promise<boolean> {
  await dbConnect();
  await CommentModel.deleteMany({ $or: [{ _id: id }, { parentId: id }] });
  return true;
}

/** Admin-only body edit. Returns the fresh serialized comment, or null if missing. */
export async function updateComment(
  id: string,
  body: string,
  viewerEmail?: string,
): Promise<Comment | null> {
  await dbConnect();
  const updated = await CommentModel.findByIdAndUpdate(
    id,
    { $set: { body } },
    { new: true },
  ).lean();
  return updated ? serializeComment(updated as IComment & { _id: unknown }, viewerEmail) : null;
}
