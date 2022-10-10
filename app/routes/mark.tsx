import { ActionArgs, json } from "@remix-run/node";
import { useActionData } from "@remix-run/react";

export async function action({ request }: ActionArgs) {
  const data = await request.formData();

  const link = data.get("link") as string;

  return json({
    link,
  });
}

export default function Mark() {
  const data = useActionData<typeof action>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>ribeirlabs / marked</h1>
      <p>Link: {data?.link}</p>
    </div>
  );
}
