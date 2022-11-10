import { linkPreviewSchema } from "@/utils/link-preview";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { env } from "./env.server";

declare global {
  var cache: Record<string, any>;
}

export const linkPreviewServer = setupServer(
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
    const safeResponse = linkPreviewSchema.safeParse(response);

    if (safeResponse.success === false) {
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

export async function getPreview(url: string) {
  linkPreviewServer.listen();

  const requestUrl = new URL(env.LINK_PREVIEW_URL);
  requestUrl.searchParams.set("key", env.LINK_PREVIEW_KEY);
  requestUrl.searchParams.set("q", decodeURIComponent(url));

  const external = await fetch(requestUrl);
  const externalJson = await external.json();

  const safeResponse = linkPreviewSchema.safeParse(externalJson);

  const response = safeResponse.success === false ? { url } : safeResponse.data;

  linkPreviewServer.close();

  return { preview: response };
}
