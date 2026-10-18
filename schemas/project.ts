import { z } from "zod";

export const projectStatusSchema = z.enum(["active", "shipped", "archived"]);

/** Payload accepted by POST/PATCH /api/projects. Slug is derived server-side. */
export const projectInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  description: z.string().max(600).default(""),
  content: z.string().default(""),
  technologies: z.array(z.string().min(1).max(40)).default([]),
  image: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  liveUrl: z.string().url().optional().or(z.literal("")),
  status: projectStatusSchema.default("active"),
  featured: z.boolean().default(false),
  /** Optional ISO date from the admin form; back-dates publishedAt/createdAt. */
  publishedAt: z.string().optional(),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;
