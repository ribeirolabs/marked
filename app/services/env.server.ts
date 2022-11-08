import type { ZodFormattedError } from "zod";
import { z } from "zod";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
export const serverSchema = z.object({
  NODE_ENV: z.enum(["production", "development"]),
  // DATABASE_URL: z.string().url(),
  // DATABASE_SHADOW_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  SESSION_SECRET: z.string(),
  LINK_PREVIEW_KEY: z.string(),
  LINK_PREVIEW_URL: z.string(),
});

export const formatErrors = (errors: ZodFormattedError<Map<string, string>>) =>
  Object.entries(errors)
    .map(([name, value]) => {
      if (value && "_errors" in value) {
        return `${name}: ${value._errors.join(", ")}\n`;
      }

      return false;
    })
    .filter(Boolean);

const _serverEnv = serverSchema.safeParse(process.env);

if (_serverEnv.success === false) {
  console.error(
    "❌ Invalid environment variables:\n",
    ...formatErrors(_serverEnv.error.format())
  );
  throw new Error("Invalid environment variables");
}

/**
 * Validate that server-side environment variables are not exposed to the client.
 */
for (let key of Object.keys(_serverEnv.data)) {
  if (key.startsWith("NEXT_PUBLIC_")) {
    console.warn("❌ You are exposing a server-side env-variable:", key);

    throw new Error("You are exposing a server-side env-variable");
  }
}

export const env = _serverEnv.data;
