import { z } from "zod";

export const postStatusSchema = z.enum(["draft", "published", "archived"]);

/** Payload accepted by POST/PATCH /api/posts. Slug is derived server-side. */
export const postInputSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  /** Optional custom URL slug; sanitized + uniquified server-side. */
  slug: z.string().trim().max(200).optional().or(z.literal("")),
  excerpt: z.string().max(400).default(""),
  content: z.string().default(""),
  coverImage: z.string().url().optional().or(z.literal("")),
  category: z.string().min(1, "Category is required").max(80),
  tags: z.array(z.string().min(1).max(40)).default([]),
  status: postStatusSchema.default("draft"),
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
  seoTitle: z.string().max(120).optional().or(z.literal("")),
  seoDescription: z.string().max(300).optional().or(z.literal("")),
  seoImage: z.string().url().optional().or(z.literal("")),
});

export type PostInput = z.infer<typeof postInputSchema>;
