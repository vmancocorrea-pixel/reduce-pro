import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login", search: { redirect: location.href } as never });
    }

    // Si volvió de Google OAuth con un rol pendiente, lo asignamos.
    if (typeof window !== "undefined") {
      const pending = sessionStorage.getItem("pending_role");
      if (pending) {
        sessionStorage.removeItem("pending_role");
        const { data: existing } = await supabase
          .from("user_roles").select("id").eq("user_id", data.session.user.id).limit(1);
        if (!existing || existing.length === 0) {
          await supabase.from("user_roles").insert({
            user_id: data.session.user.id,
            role: pending as "empresa" | "consumidor" | "fundacion",
          });
        }
      }
    }
  },
  component: () => <Outlet />,
});
