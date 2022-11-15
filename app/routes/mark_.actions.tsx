import { requireAuth } from "@/services/auth.server";
import { prisma } from "@/services/db.server";
import { getPreview } from "@/services/link-preview.server";
import { type ActionArgs, json, redirect } from "@remix-run/node";
import { z } from "zod";

const deleteRequestSchema = z.object({
  intent: z.enum(["delete"]),
  markId: z.string().cuid(),
});

const previewRequestSchema = z.object({
  intent: z.enum(["preview"]),
  url: z.string().url(),
});

const requestSchema = deleteRequestSchema.or(previewRequestSchema);

export async function action({ request }: ActionArgs) {
  await requireAuth(request);

  const requestData = Object.fromEntries(await request.formData());
  const safeRequest = requestSchema.safeParse(requestData);

  if (safeRequest.success === false) {
    throw json(
      {
        request: requestData,
        error: safeRequest.error,
      },
      400
    );
  }

  const { data } = safeRequest;

  if (data.intent === "delete") {
    await prisma.mark.delete({
      where: {
        id: data.markId,
      },
    });
  }

  if (data.intent === "preview") {
    return json(await getPreview(data.url), {
      headers: new Headers([["Cache-Control", "max-age=86400"]]),
    });
  }

  return redirect(request.referrer);
}
