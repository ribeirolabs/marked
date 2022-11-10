import { useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export function ClipboardListener() {
  const navigate = useNavigate();

  useEffect(() => {
    async function onPaste(event: ClipboardEvent) {
      const url = event.clipboardData?.getData("text");

      if (url == null || url === "") {
        return;
      }

      navigate(`/mark?${new URLSearchParams([["url", url]])}`);
    }

    document.addEventListener("paste", onPaste);

    return () => document.removeEventListener("paste", onPaste);
  }, [navigate]);

  return null;
}
