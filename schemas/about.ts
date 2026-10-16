import { z } from "zod";

/** Validation for the editable About-page document. */
export const aboutInputSchema = z.object({
  intro: z.string().min(1, "Intro is required"),
  skills: z
    .array(
      z.object({
        group: z.string().min(1),
        icon: z.string().min(1),
        items: z.array(z.string().min(1)),
      }),
    )
    .default([]),
  journey: z
    .array(
      z.object({
        year: z.string().min(1),
        title: z.string().min(1),
        body: z.string().min(1),
        featured: z.boolean().default(false),
      }),
    )
    .default([]),
});

export type AboutInputParsed = z.infer<typeof aboutInputSchema>;
