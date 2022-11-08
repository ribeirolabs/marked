import { auth, authRoutes } from "@/services/auth.server";
import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = ({ request }) => {
  return auth(request).authenticate("google", request, {
    successRedirect: authRoutes.success,
    failureRedirect: authRoutes.failure,
  });
};
