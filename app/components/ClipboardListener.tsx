import { useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export function ClipboardListener() {
  const navigate = useNavigate();

  useEffect(() => {
    async function onPaste(event: ClipboardEvent) {
      const link = event.clipboardData?.getData("text");

      if (link == null) {
        return;
      }

      navigate(`/mark?${new URLSearchParams([["link", link]])}`);
    }

    document.addEventListener("paste", onPaste);

    return () => document.removeEventListener("paste", onPaste);
  }, [navigate]);

  return null;
}
