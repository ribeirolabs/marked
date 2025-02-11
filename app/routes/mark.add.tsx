import { MarkForm } from "@/components/MarkForm";
import { requireAuth } from "@/services/auth.server";
import { prisma } from "@/services/db.server";
import { type LinkPreviewResponse } from "@/utils/link-preview";
import {
  type ActionArgs,
  json,
  redirect,
  type LoaderArgs,
} from "@remix-run/node";
import { useCatch, useFetcher, useLoaderData } from "@remix-run/react";
import { type CatchBoundaryComponent } from "@remix-run/react/dist/routeModules";
import { useEffect } from "react";
import { z } from "zod";

export async function loader({ request }: LoaderArgs) {
  const searchSchema = z.object({
    link: z
      .string()
      .url()
      .nullish()
      .transform((v) => (v === "" ? null : v)),
    text: z.string().nullish(),
  });

  const responseSchema = z.object({
    link: z.string().url(),
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

  const url = search.data.link || search.data.text || "";

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
  const { link: url } = useLoaderData<typeof loader>();
  const { data, submit, state } = useFetcher<{
    preview: LinkPreviewResponse;
  }>();

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

  return <MarkForm initial={} />;
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
