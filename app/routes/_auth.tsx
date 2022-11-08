import { Outlet } from "@remix-run/react";

export default function Auth() {
  return (
    <div>
      <h1>Auth</h1>
      <Outlet />
    </div>
  );
}
