import { requireAuth } from "@/services/auth.server";
import { getUserBySession } from "@/services/user.server";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request }: LoaderArgs) {
  const user = await getUserBySession(await requireAuth(request));

  return json({ user });
}

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>ribeirlabs / marked</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>

      <h2>Latest</h2>
    </div>
  );
}
