import { randomUUID } from "crypto";
import { Authenticator } from "remix-auth";
import { GoogleStrategy } from "remix-auth-google";
import {
  destroySession,
  getSession,
  sessionStorage,
} from "@/services/session.server";
import { env } from "@/services/env.server";
import { prisma } from "./db.server";
import type { Session } from "@prisma/client";
import { redirect } from "@remix-run/node";

const googleAuth = (domain: string) =>
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${domain}/auth/callback/google`,
    },
    async ({ profile, accessToken, extraParams, refreshToken }) => {
      try {
        const provider = profile.provider;
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const avatar = profile.photos[0]?.value;

        const user = await prisma.user.upsert({
          create: {
            email,
            name,
            avatar,
          },
          update: {
            avatar,
          },
          where: {
            email,
          },
        });

        await prisma.account.upsert({
          create: {
            type: "oauth",
            provider,
            accessToken,
            refreshToken,
            providerAccountId: profile.id,
            tokenType: extraParams.token_type,
            idToken: extraParams.id_token,
            scope: extraParams.scope,
            expiresAt: extraParams.expires_in,
            userId: user.id,
          },
          update: {
            accessToken,
            refreshToken,
            tokenType: extraParams.token_type,
            scope: extraParams.scope,
            expiresAt: extraParams.expires_in,
            idToken: extraParams.id_token,
          },
          where: {
            provider_providerAccountId: {
              provider,
              providerAccountId: profile.id,
            },
          },
        });

        const session = await prisma.session.create({
          data: {
            expires: new Date(Date.now() + extraParams.expires_in),
            token: randomUUID(),
            userId: user.id,
          },
        });

        return session;
      } catch (e: any) {
        console.log(e);
        throw e;
      }
    }
  );

export const auth = (request: Request) => {
  const auth = new Authenticator<Session>(sessionStorage);

  const url = new URL(request.url);

  const domain =
    env.NODE_ENV === "development"
      ? `http://localhost:${url.port}`
      : url.origin;

  auth.use(googleAuth(domain));

  return auth;
};

export const logout = async (request: Request) => {
  const session = await auth(request).isAuthenticated(request);

  if (session) {
    await Promise.all([
      prisma.session.delete({
        where: {
          id: session.id,
        },
      }),

      auth(request).logout(request, { redirectTo: authRoutes.failure }),
    ]);
  }

  return redirect("/signin", {
    headers: {
      "Set-Cookie": await destroySession(
        await getSession(request.headers.get("cookie"))
      ),
    },
  });
};

export const requireAuth = (request: Request) =>
  auth(request).isAuthenticated(request, {
    failureRedirect: authRoutes.failure,
  });

export const authRoutes = {
  success: "/",
  failure: "/signin",
};
