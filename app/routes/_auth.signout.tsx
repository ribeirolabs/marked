import { logout } from "@/services/auth.server";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";

export const loader: LoaderFunction = ({ request }) => logout(request);

export const action: ActionFunction = ({ request }) => logout(request);
