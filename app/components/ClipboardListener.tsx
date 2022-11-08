import { PreviewResponse } from "@/routes/preview";
import { useEffect, useState } from "react";

export function ClipboardListener() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PreviewResponse>();

  useEffect(() => {
    function onPaste(event: ClipboardEvent) {
      const link = event.clipboardData?.getData("text");

      if (link == null) {
        return;
      }

      setLoading(true);

      fetch(`/preview?${new URLSearchParams([["link", link]])}`)
        .then((res) => res.json())
        .then((json) => setData(json.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }

    document.addEventListener("paste", onPaste);

    return () => document.removeEventListener("paste", onPaste);
  }, []);

  if (loading) {
    return <p>Loading....</p>;
  }

  if (data == null) {
    return null;
  }

  return (
    <div>
      <hr />
      <h2>New Mark</h2>

      <p>
        <b>Title:</b>
        <br />
        {data.title}
      </p>
      <p>
        <b>Description:</b>
        <br />
        {data.description}
      </p>
      <p>
        <b>Url:</b>
        <br />
        {data.url}
      </p>
      <img src={data.image} alt={data.title} style={{ maxWidth: "100%" }} />
    </div>
  );
}
