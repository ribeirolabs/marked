import { prisma } from "@/services/db.server";
import { requireUser } from "@/services/user.server";
import type { LoaderArgs, SerializeFrom } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useFetcher, useLoaderData } from "@remix-run/react";
import type { HTMLProps, PropsWithChildren } from "react";

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);

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
      ownerId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  return json({ marks, user });
}

export default function Index() {
  const { marks, user } = useLoaderData<typeof loader>();

  return (
    <div className="p-4">
      <header className="flex justify-between items-center border-b pb-2 mb-4">
        <h2 className="font-bold text-xl">r / marked</h2>
        <div className="flex flex-col gap-2 items-end">
          <p className="text-xs">{user.email}</p>
          <Link className="btn btn-sm" to="/auth/signout">
            Sign out
          </Link>
        </div>
      </header>
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

        <div className="flex gap-2 pt-3 items-center">
          {mark.tags.length > 0 ? (
            mark.tags.map((tag) => (
              <span
                key={tag.id}
                className="btn btn-xs lowercase rounded-full px-3 font-bold font-mono"
              >
                {tag.name.replace(/\s/g, "-")}
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
