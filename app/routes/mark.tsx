import { prisma } from "@/services/db.server";
import { env } from "@/services/env.server";
import { previewSchema, server } from "@/services/link-preview.server";
import { requireUser } from "@/services/user.server";
import {
  type ActionArgs,
  json,
  redirect,
  type LoaderArgs,
} from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { z } from "zod";

const searchSchema = z.object({
  link: z.string().url(),
});

const responseSchema = z.object({
  mark: previewSchema.omit({ url: true }).merge(searchSchema),
});

export async function loader({ request }: LoaderArgs) {
  await requireUser(request);

  server.listen();

  const search = searchSchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams)
  );

  if (search.success === false) {
    server.close();

    throw json(
      {
        error: search.error,
      },
      400
    );
  }

  const url = new URL(env.LINK_PREVIEW_URL);

  url.searchParams.set("key", env.LINK_PREVIEW_KEY);
  url.searchParams.set("q", decodeURIComponent(search.data.link));

  const response = await fetch(url);
  const parsedResponse = previewSchema.safeParse(await response.json());

  if (parsedResponse.success === false) {
    server.close();

    return json(
      responseSchema.parse({
        mark: {
          link: search.data.link,
        },
      })
    );
  }

  const { title, description, image, url: link } = parsedResponse.data;

  server.close();

  return json(
    responseSchema.parse({
      mark: {
        title,
        description,
        image,
        link,
      },
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
  console.log("ACTION");
  const user = await requireUser(request);
  console.log("USER", user.email);

  const formData = Object.fromEntries((await request.formData()).entries());
  console.log(formData);
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
      ownerId: user.id,
      tags: {
        connectOrCreate: tags.map((name) => ({
          create: {
            ownerId: user.id,
            name,
          },
          where: {
            name_ownerId: {
              name,
              ownerId: user.id,
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
  const actionResponse = useActionData<typeof action>();

  return (
    <div className="p-4">
      <h1>ribeirlabs / marked</h1>

      <pre>{JSON.stringify(actionResponse, null, 2)}</pre>

      <form className="w-full" action="" method="post">
        <h2 className="font-bold text-3xl text-red">New Mark</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold">Title</span>
              </label>
              <input
                type="text"
                name="title"
                className="input input-bordered w-full"
                defaultValue={data.mark.title || ""}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold">Description</span>
              </label>
              <input
                type="text"
                name="description"
                className="input input-bordered w-full"
                defaultValue={data.mark.description || ""}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold">Link</span>
              </label>
              <input
                type="text"
                name="link"
                className="input input-bordered w-full"
                readOnly
                value={data.mark.link}
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

            <div className="divider"></div>

            <div className="flex gap-2 justify-end">
              <button className="btn" type="button">
                Cancel
              </button>
              <button className="btn btn-primary" type="submit">
                Save
              </button>
            </div>
          </div>
          <div>
            {data.mark.image ? (
              <div className="max-w-lg">
                <input type="hidden" name="image" value={data.mark.image} />
                <img src={data.mark.image} alt={data.mark.title ?? ""} />
              </div>
            ) : null}
          </div>
        </div>
      </form>
    </div>
  );
}
