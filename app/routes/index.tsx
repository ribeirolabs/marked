import { requireAuth } from "@/services/auth.server";
import { getUserBySession, requireUser } from "@/services/user.server";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);

  return json({ user });
}

export default function Index() {
  const data = useLoaderData<typeof loader>();

  const [show, setShow] = useState(false);

  return (
    <div className="p-4">
      <h1 className="font-bold">ribeirlabs / marked</h1>
      <h2 className="text-xl ml-1">Latest</h2>
    </div>
  );
}
