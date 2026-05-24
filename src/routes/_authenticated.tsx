import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabaseApp as supabase } from "@/lib/supabase-app";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login", search: { redirect: location.href } as never });
    }
  },
  component: () => <Outlet />,
});
