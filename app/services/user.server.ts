import type { Session } from "@prisma/client";
import { redirect } from "@remix-run/node";
import { auth, authRoutes } from "./auth.server";
import { prisma } from "./db.server";

export const getUserById = (id: string) =>
  prisma.user.findUnique({
    where: {
      id,
    },
  });

export const getUserBySession = async (session: Session) => {
  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
  });

  if (user == null) {
    throw redirect(authRoutes.failure);
  }

  return user;
};

export const requireUser = async (request: Request) =>
  getUserBySession(
    await auth(request).isAuthenticated(request, {
      failureRedirect: authRoutes.failure,
    })
  );
