import { requireAuth } from "@/services/auth.server";
import { prisma } from "@/services/db.server";
import { type LinkPreviewResponse } from "@/utils/link-preview";
import {
  type ActionArgs,
  json,
  redirect,
  type LoaderArgs,
} from "@remix-run/node";
import { Link, useCatch, useFetcher, useLoaderData } from "@remix-run/react";
import { type CatchBoundaryComponent } from "@remix-run/react/dist/routeModules";
import { useEffect, useState } from "react";
import { z } from "zod";

export async function loader({ request }: LoaderArgs) {
  const searchSchema = z.object({
    url: z
      .string()
      .url()
      .nullish()
      .transform((v) => (v === "" ? null : v)),
    text: z.string().nullish(),
  });

  const responseSchema = z.object({
    url: z.string().url(),
  });

  await requireAuth(request);

  const search = searchSchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams)
  );

  if (search.success === false) {
    throw json(
      {
        url: request.url,
        error: search.error,
      },
      400
    );
  }

  const url = search.data.url || search.data.text || "";

  if (/http/.test(url) === false) {
    throw json(
      {
        error: {
          message: `Invalid URL: ${url}`,
        },
      },
      400
    );
  }

  return json(
    responseSchema.parse({
      url,
    })
  );
}

const actionSchema = z.object({
  title: z.string().nullish(),
  description: z.string().nullish(),
  link: z.string().url(),
  image: z
    .string()
    .url()
    .nullish()
    .transform((value) => (value === "" ? null : value)),
  folder: z.string().nullish(),
  tags: z.string().nullish(),
});

export async function action({ request }: ActionArgs) {
  const session = await requireAuth(request);

  const formData = Object.fromEntries(await request.formData());
  const actionRequest = actionSchema.safeParse(formData);

  if (actionRequest.success === false) {
    throw json(
      {
        error: actionRequest.error,
      },
      400
    );
  }

  const { data } = actionRequest;

  const domain = new URL(data.link).host.replace(/^www\./, "");

  const tags =
    data.tags
      ?.split(",")
      ?.map((tag) => tag.trim())
      .filter(Boolean) ?? [];

  await prisma.mark.create({
    data: {
      domain,
      link: data.link,
      title: data.title,
      description: data.description,
      thumbnail: data.image,
      ownerId: session.userId,
      tags: {
        connectOrCreate: tags.map((name) => ({
          create: {
            ownerId: session.userId,
            name,
          },
          where: {
            name_ownerId: {
              name,
              ownerId: session.userId,
            },
          },
        })),
      },
    },
    select: {
      id: true,
    },
  });

  return redirect("/");
}

export default function Mark() {
  const { url } = useLoaderData<typeof loader>();
  const { data, submit, state } = useFetcher<{
    preview: LinkPreviewResponse;
  }>();

  const [useImage, setUseImage] = useState(true);

  useEffect(() => {
    const data = new FormData();

    data.set("intent", "preview");
    data.set("url", url);

    submit(data, {
      action: "/mark/actions",
      method: "post",
    });
  }, [url, submit]);

  const isLoading = state !== "idle";

  return (
    <div className="h-screen w-full flex p-4 items-center justify-center overflow-hidden">
      <form
        className="w-full md:w-3/4 lg:w-1/2 xl:w-1/3 flex h-full flex-col overflow-hidden p-0 border"
        action=""
        method="post"
      >
        <div className="flex-shrink-0 p-4 border-b">
          <h2 className="font-bold text-xl text-red">New Mark</h2>
          <a
            className="text-xs link"
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            {url}
          </a>
          <input type="hidden" name="link" value={url} />
        </div>

        <div className="flex-1 grid gap-4 overflow-y-scroll px-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold">Title</span>
            </label>
            <input
              type="text"
              name="title"
              className="input input-bordered w-full"
              disabled={isLoading}
              defaultValue={data?.preview?.title ?? ""}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              disabled={isLoading}
              name="description"
              value={data?.preview?.description ?? ""}
              readOnly
              rows={5}
            ></textarea>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold">Folder</span>
            </label>
            <select className="select select-bordered w-full" name="folder">
              <option></option>
              <option>Sports</option>
              <option>Sports / NBA</option>
              <option>Sports / NBA / Heat</option>
              <option>House</option>
              <option>Trip</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold">Tags</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              name="tags"
            />
            <label className="label">
              <span className="label-text-alt">Separated by comma</span>
            </label>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold">Thumbnail</span>
            </label>
            <div className="aspect-video bg-base-300 relative">
              {data?.preview.image && useImage ? (
                <>
                  <input
                    type="hidden"
                    name="image"
                    value={data.preview.image}
                  />
                  <img
                    src={data.preview.image}
                    alt={data.preview.title ?? ""}
                  />
                </>
              ) : null}

              <div className="absolute left-0 top-0 w-full h-full flex p-2 justify-end">
                <button
                  className="btn btn-xs"
                  type="button"
                  onClick={() => setUseImage(false)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-action flex-shrink-0 p-4 border-t">
          <Link className="btn" to="/" replace={true}>
            Cancel
          </Link>
          <button className="btn btn-primary" type="submit">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

export const CatchBoundary: CatchBoundaryComponent = () => {
  const caught = useCatch();

  return (
    <div className="p-4">
      <pre className="p-4 bg-error-content text-white">
        {JSON.stringify(caught, null, 2)}
      </pre>
    </div>
  );
};
