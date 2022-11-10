import { z } from "zod";

export const markUrlSchema = z.string().url();

const emptyToNull = (v?: string | null) => (v === "" ? null : v);

export const linkPreviewSchema = z.object({
  title: z.string().nullish().transform(emptyToNull),
  description: z.string().nullish().transform(emptyToNull),
  image: z.string().url().nullish().transform(emptyToNull),
  url: z.string().url(),
});

export type LinkPreviewResponse = z.infer<typeof linkPreviewSchema>;
