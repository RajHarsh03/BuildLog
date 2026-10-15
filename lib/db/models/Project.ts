import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";
import type { Project, ProjectStatus } from "@/types/project";

export interface IProject {
  name: string;
  slug: string;
  description: string;
  content?: string;
  technologies: string[];
  image?: string;
  githubUrl?: string;
  liveUrl?: string;
  status: ProjectStatus;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectDocument = HydratedDocument<IProject>;

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    content: { type: String },
    technologies: { type: [String], default: [] },
    image: { type: String },
    githubUrl: { type: String },
    liveUrl: { type: String },
    status: {
      type: String,
      enum: ["active", "shipped", "archived"],
      default: "active",
      index: true,
    },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

/**
 * Convert a Mongoose document, or a `.lean()` plain object, into a plain
 * JSON-safe Project object. Read paths use `.lean()`, so `toObject` is absent.
 */
export function serializeProject(
  doc: ProjectDocument | IProject & { _id: unknown },
): Project {
  const obj = (
    typeof (doc as ProjectDocument).toObject === "function"
      ? (doc as ProjectDocument).toObject({ virtuals: false })
      : doc
  ) as IProject & { _id: unknown };
  return {
    _id: String(obj._id),
    name: obj.name,
    slug: obj.slug,
    description: obj.description ?? "",
    content: obj.content,
    technologies: obj.technologies ?? [],
    image: obj.image,
    githubUrl: obj.githubUrl,
    liveUrl: obj.liveUrl,
    status: obj.status,
    featured: obj.featured ?? false,
    createdAt: new Date(obj.createdAt).toISOString(),
    updatedAt: new Date(obj.updatedAt).toISOString(),
  };
}

export const ProjectModel: Model<IProject> =
  (mongoose.models.Project as Model<IProject>) ||
  mongoose.model<IProject>("Project", ProjectSchema);
