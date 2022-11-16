import { auth } from "@/services/auth.server";
import {
  destroySession,
  getSession,
  SESSION_NAME,
} from "@/services/session.server";
import { getUserById } from "@/services/user.server";
import { json, LoaderFunction, redirect } from "@remix-run/node";
import { Form, useTransition } from "@remix-run/react";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await auth(request).isAuthenticated(request);

  if (session != null) {
    const user = await getUserById(session.userId);

    if (user == null) {
      return redirect(request.url, {
        headers: {
          "Set-Cookie": await destroySession(await getSession(SESSION_NAME)),
        },
      });
    }
  }

  return json({});
};

export default function SignIn() {
  const { state } = useTransition();

  return (
    <div className="pt-4">
      <Form
        action="/auth/google"
        method="post"
        className="max-w-lg mx-auto p-4 rounded"
      >
        <h2 className="text-2xl font-bold">ribeirolabs / marked</h2>
        <div className="divider my-2"></div>

        <button className="btn btn-block" disabled={state !== "idle"}>
          <i className="fa-brands fa-google"></i>
          Entrar com Google
        </button>
      </Form>
    </div>
  );
}
