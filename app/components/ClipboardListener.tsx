import { markUrlSchema } from "@/utils/link-preview";
import { useNavigate } from "@remix-run/react";
import { useEffect } from "react";

const INPUT_TYPES = /(input|textarea)/i;

export function ClipboardListener() {
  const navigate = useNavigate();

  useEffect(() => {
    async function onPaste(event: ClipboardEvent) {
      const url = markUrlSchema.safeParse(event.clipboardData?.getData("text"));

      if (url.success === false) {
        return;
      }

      const target = event.target as HTMLElement;

      if (INPUT_TYPES.test(target.tagName)) {
        return;
      }

      navigate(`/mark?${new URLSearchParams([["url", url.data]])}`, {
        state: {
          background: true,
        },
      });
    }

    document.addEventListener("paste", onPaste);

    return () => document.removeEventListener("paste", onPaste);
  }, [navigate]);

  return null;
}
