import { rest } from "msw";
import { setupServer } from "msw/node";
import { z } from "zod";
import { env } from "./env.server";

export const previewSchema = z.object({
  title: z.string().nullish(),
  description: z.string().nullish(),
  image: z.string().nullish(),
  url: z.string(),
});

declare global {
  var cache: Record<string, any>;
}

export const server = setupServer(
  rest.get(env.LINK_PREVIEW_URL, async (req, res, ctx) => {
    if (!global.cache) {
      global.cache = {};
    }

    const url = req.url.toString();

    if (url in global.cache) {
      console.log("[msw] getting from cache:", url);
      return res(ctx.json(global.cache[url]));
    }

    const response = await (await ctx.fetch(req)).json();
    const safeResponse = previewSchema.safeParse(response);

    if (safeResponse.success === false) {
      const response = {
        url,
      };

      global.cache[req.url.toString()] = response;

      return res(ctx.json(response));
    }

    global.cache[req.url.toString()] = safeResponse;

    return res(ctx.json(safeResponse));
  })
);
