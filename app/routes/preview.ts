import { env } from "@/services/env.server";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";

const searchSchema = z.object({
  link: z.string().url(),
});

const previewSchema = z.object({
  title: z.string(),
  description: z.string(),
  image: z.string().url(),
  url: z.string().url(),
});

export type PreviewResponse = z.infer<typeof previewSchema>;

export async function loader({ request }: LoaderArgs) {
  const search = searchSchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams)
  );

  if (search.success === false) {
    return json(
      {
        error: search.error,
      },
      400
    );
  }

  const query = new URLSearchParams([
    ["key", env.LINK_PREVIEW_KEY],
    ["q", search.data.link],
  ]);

  const response = await fetch(`${env.LINK_PREVIEW_URL}?${query}`);

  const parsedResponse = previewSchema.safeParse(await response.json());

  if (parsedResponse.success === false) {
    return json(
      {
        error: parsedResponse.error,
      },
      500
    );
  }

  return json({
    data: parsedResponse.data,
  });
}
