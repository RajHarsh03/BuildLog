import { z } from "zod";

export const projectStatusSchema = z.enum(["active", "shipped", "archived"]);

/** Payload accepted by POST/PATCH /api/projects. Slug is derived server-side. */
export const projectInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  /** Optional custom URL slug; sanitized + uniquified server-side. */
  slug: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().max(600).default(""),
  content: z.string().default(""),
  technologies: z.array(z.string().min(1).max(40)).default([]),
  image: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  liveUrl: z.string().url().optional().or(z.literal("")),
  status: projectStatusSchema.default("active"),
  featured: z.boolean().default(false),
  /** Optional ISO date from the admin form; back-dates publishedAt/createdAt.
   * Future dates are rejected — the 24h slack lets a "today" noon stamp in
   * any timezone pass while still blocking real future picks. */
  publishedAt: z
    .string()
    .optional()
    .refine((v) => !v || new Date(v).getTime() <= Date.now() + 24 * 3600 * 1000, {
      message: "Publish date cannot be in the future",
    }),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;
