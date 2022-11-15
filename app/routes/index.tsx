import { requireAuth } from "@/services/auth.server";
import { prisma } from "@/services/db.server";
import type { LoaderArgs, SerializeFrom } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useFetcher, useLoaderData } from "@remix-run/react";
import { HTMLProps, PropsWithChildren } from "react";

export async function loader({ request }: LoaderArgs) {
  const { userId } = await requireAuth(request);

  const marks = await prisma.mark.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      domain: true,
      tags: {
        select: {
          id: true,
          name: true,
        },
      },
      thumbnail: true,
      link: true,
    },
    where: {
      ownerId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  return json({ marks });
}

export default function Index() {
  const { marks } = useLoaderData<typeof loader>();

  return (
    <div className="p-4">
      <h2 className="font-bold text-xl">Latest</h2>

      <div className="max-w-lg grid gap-5">
        {marks.map((mark) => (
          <Mark key={mark.id} mark={mark} />
        ))}
      </div>

      <Outlet />
    </div>
  );
}

function Mark({
  mark,
}: {
  mark: Awaited<SerializeFrom<typeof loader>>["marks"][number];
}) {
  const deleteFetcher = useFetcher();

  const MarkLink = ({
    children,
    ...props
  }: PropsWithChildren<HTMLProps<HTMLAnchorElement>>) => (
    <a {...props} href={mark.link} rel="noreferrer" target="_blank">
      {children}
    </a>
  );

  return (
    <div
      key={mark.id}
      className="card w-full border rounded-md overflow-hidden"
      data-loading={deleteFetcher.state !== "idle"}
    >
      <div className="p-4">
        <div className="flex justify-between">
          <MarkLink className="flex-1">
            <h3 className="font-bold">{mark.title}</h3>
            <p className="text-xs">{mark.domain}</p>
          </MarkLink>

          <deleteFetcher.Form action="/mark/actions" method="post">
            <input type="hidden" name="markId" value={mark.id} />

            <button
              className="btn btn-xs"
              disabled={deleteFetcher.state === "submitting"}
              name="intent"
              value="delete"
            >
              Remove
            </button>
          </deleteFetcher.Form>
        </div>

        {mark.description ? (
          <p className="text-sm my-3 line-clamp-3">{mark.description}</p>
        ) : null}

        <div className="flex gap-1 pt-3 items-center">
          <span className="text-sm">Tags:</span>

          {mark.tags.length > 0 ? (
            mark.tags.map((tag) => (
              <span key={tag.id} className="badge badge-primary font-bold">
                #{tag.name}
              </span>
            ))
          ) : (
            <button type="button" className="btn btn-circle btn-xs">
              +
            </button>
          )}
        </div>
      </div>

      {mark.thumbnail ? (
        <MarkLink>
          <figure className="aspect-video bg-base-300">
            <img src={mark.thumbnail} alt={mark.title ?? ""} />
          </figure>
        </MarkLink>
      ) : (
        <div className="w-full h-full bg-base-300"></div>
      )}
    </div>
  );
}
