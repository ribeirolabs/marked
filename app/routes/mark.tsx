import { json, LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request }: LoaderArgs) {
  const { searchParams } = new URL(request.url);

  const url = searchParams.get("url") as string;
  const title = searchParams.get("title") as string;
  const text = searchParams.get("text") as string;

  return json({
    url,
    title,
    text,
  });
}

export default function Mark() {
  const data = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>ribeirlabs / marked</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
