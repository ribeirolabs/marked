import type { Session } from "@prisma/client";
import { prisma } from "./db.server";

export const getUserById = (id: string) =>
  prisma.user.findUnique({
    where: {
      id,
    },
  });

export const getUserBySession = (session: Session) =>
  prisma.user.findUnique({
    where: {
      id: session.userId,
    },
  });
