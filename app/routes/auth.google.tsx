import { auth } from "@/services/auth.server";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const loader: LoaderFunction = () => redirect("/login");

export const action: ActionFunction = ({ request }) =>
  auth(request).authenticate("google", request);
