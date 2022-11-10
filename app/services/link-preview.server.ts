import { markSchema } from "@/utils/link-preview";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { env } from "./env.server";

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
    const safeResponse = markSchema.safeParse(response);

    if (safeResponse.success === false) {
      console.log(response, safeResponse.error);
      const a = {
        url,
      };

      global.cache[req.url.toString()] = a;

      return res(ctx.json(a));
    }

    global.cache[req.url.toString()] = safeResponse.data;

    return res(ctx.json(safeResponse.data));
  })
);
