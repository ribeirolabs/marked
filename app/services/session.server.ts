import { env } from "@/services/env.server";
import { createCookieSessionStorage } from "@remix-run/node";

export const SESSION_NAME = "@app/session";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: SESSION_NAME,
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [env.SESSION_SECRET],
    secure: env.NODE_ENV === "production",
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
