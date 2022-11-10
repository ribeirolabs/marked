import { prisma } from "@/services/db.server";
import { requireUser } from "@/services/user.server";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);

  const marks = await prisma.mark.findMany({
    select: {
      id: true,
      title: true,
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

  return json({ marks });
}

export default function Index() {
  const { marks } = useLoaderData<typeof loader>();

  return (
    <div className="p-4">
      <h2 className="font-bold text-xl">Latest</h2>

      <div className="max-w-lg grid gap-3">
        {marks.map((mark) => {
          return (
            <a
              key={mark.id}
              className="card w-full bordered rounded-md"
              href={mark.link}
              rel="noreferrer"
              target="_blank"
            >
              <div className="p-4">
                <h3 className="font-bold">{mark.title}</h3>
                <p className="text-xs">{mark.domain}</p>
                <div className="flex gap-1 pt-3">
                  {mark.tags.map((tag) => (
                    <span key={tag.id} className="badge">
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
              {mark.thumbnail ? (
                <figure className="aspect-video bg-base-300">
                  <img src={mark.thumbnail} alt={mark.title ?? ""} />
                </figure>
              ) : (
                <div className="w-full h-full bg-base-300"></div>
              )}
            </a>
          );
        })}
      </div>

      <Outlet />
    </div>
  );
}
