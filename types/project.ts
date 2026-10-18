export type ProjectStatus = "active" | "shipped" | "archived";

/** Serialized project shape used across server components and the API. */
export interface Project {
  _id: string;
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
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectSummary = Omit<Project, "content">;
