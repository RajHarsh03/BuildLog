/** A GitHub-authenticated reader comment on an article. */
export interface Comment {
  _id: string;
  postId: string;
  /** null for top-level comments; the parent comment's _id for replies. */
  parentId: string | null;
  body: string;
  authorName: string;
  authorEmail?: string | null;
  authorImage?: string | null;
  authorLogin?: string | null;
  likes: number;
  likedByMe: boolean;
  likedByNames: string[];
  createdAt: string;
}
