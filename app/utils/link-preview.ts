import { z } from "zod";

export const markUrlSchema = z.string().url();

export const markSchema = z.object({
  title: z.string().nullish(),
  description: z.string().nullish(),
  image: z.string().nullish(),
  url: markUrlSchema,
});
