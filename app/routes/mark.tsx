import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Fragment } from "react";

export async function loader({ request }: LoaderArgs) {
  const { searchParams } = new URL(request.url);

  return json(
    Array.from(searchParams.entries()).reduce((values, [key, value]) => {
      values[key] = value;
      return values;
    }, {} as Record<string, string>)
  );
}

export default function Mark() {
  const data = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>ribeirlabs / marked</h1>
      {Object.keys(data).map((key) => (
        <Fragment key={key}>
          <p>
            <b>{key}:</b>
            <br />
            <span>{data[key]}</span>
          </p>
        </Fragment>
      ))}
    </div>
  );
}
