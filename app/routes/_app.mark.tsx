import { requireAuth } from "@/services/auth.server";
import { prisma } from "@/services/db.server";
import { env } from "@/services/env.server";
import { server } from "@/services/link-preview.server";
import { requireUser } from "@/services/user.server";
import { markSchema, markUrlSchema } from "@/utils/link-preview";
import {
  type ActionArgs,
  json,
  redirect,
  type LoaderArgs,
} from "@remix-run/node";
import { Link, useCatch, useLoaderData } from "@remix-run/react";
import { type CatchBoundaryComponent } from "@remix-run/react/dist/routeModules";
import { z } from "zod";

export async function loader({ request }: LoaderArgs) {
  const searchSchema = z.object({
    url: markUrlSchema.nullish().transform((v) => (v === "" ? null : v)),
    text: z.string().nullish(),
  });

  const responseSchema = z.object({
    mark: markSchema,
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
    throw json({
      error: {
        message: `Invalid URL: ${url}`,
      },
    });
  }

  const requestUrl = new URL(env.LINK_PREVIEW_URL);

  requestUrl.searchParams.set("key", env.LINK_PREVIEW_KEY);
  requestUrl.searchParams.set("q", decodeURIComponent(url));

  return json(
    responseSchema.parse({
      mark: {
        url,
      },
    })
  );

  // const response = await fetch(requestUrl);
  // const parsedResponse = markSchema.safeParse(await response.json());

  // if (parsedResponse.success === false) {
  //   server.close();

  //   throw
  // }

  // server.close();

  // return json(
  //   responseSchema.parse({
  //     mark: parsedResponse.data,
  //   })
  // );
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

  const formData = Object.fromEntries((await request.formData()).entries());
  const actionRequest = actionSchema.safeParse(formData);

  if (actionRequest.success === false) {
    return json({
      error: actionRequest.error,
    });
  }

  const { data } = actionRequest;

  const domain = new URL(data.link).host.replace(/^www\./, "");

  const tags = data.tags?.split(",")?.map((tag) => tag.trim()) ?? [];

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
  const data = useLoaderData<typeof loader>();

  return (
    <div className="modal modal-open modal-bottom md:modal-middle">
      <form
        className="modal-box md:max-w-lg flex flex-col overflow-hidden p-0 border"
        action=""
        method="post"
      >
        <div className="flex-shrink-0 p-4 border-b">
          <h2 className="font-bold text-xl text-red">New Mark</h2>
          <a
            className="text-xs link"
            href={data.mark.url}
            target="_blank"
            rel="noreferrer"
          >
            {data.mark.url}
          </a>
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
              defaultValue={data.mark.title || ""}
              autoFocus
            />
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
            <div className="aspect-video bg-base-300">
              {data.mark.image ? (
                <div className="max-w-lg">
                  <input type="hidden" name="image" value={data.mark.image} />
                  <img src={data.mark.image} alt={data.mark.title ?? ""} />
                </div>
              ) : null}
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
