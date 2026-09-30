import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const user = localStorage.getItem("user");

    if (!user) {
      throw redirect({ to: "/auth" });
    }

    try {
      return { user: JSON.parse(user) };
    } catch {
      localStorage.removeItem("user");
      throw redirect({ to: "/auth" });
    }
  },
  component: () => <Outlet />,
});
