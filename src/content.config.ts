import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const book = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/book" }),
  schema: z.object({
    slug: z.string(),
    order: z.number().int().nonnegative(),
    number: z.string().optional(),
    kind: z.enum(["front", "chapter", "appendix"]),
    part: z.string(),
    partOrder: z.number().int().nonnegative(),
    title: z.string(),
    shortTitle: z.string().optional(),
    summary: z.string(),
    status: z.enum(["draft", "source-checked", "verified"]),
    gates: z.array(z.enum(["sources", "links", "interaction", "editorial"])).default([]),
    objectives: z.array(z.string()).default([]),
    keywords: z.array(z.string()).default([]),
    sourceAreas: z.array(z.string()).default([]),
    visuals: z.array(z.string()).default([]),
    updatedAt: z.coerce.date(),
  }),
});

export const collections = { book };
