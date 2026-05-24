import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "empresa" | "consumidor" | "fundacion" | "admin";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => {
          void fetchRole(s.user.id).then(setRole);
        }, 0);
      } else {
        setRole(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) void fetchRole(s.user.id).then(setRole);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, user, role, loading };
}

async function fetchRole(userId: string): Promise<AppRole | null> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  return (data?.role as AppRole | undefined) ?? null;
}

export function roleHome(role: AppRole | null): string {
  switch (role) {
    case "empresa": return "/empresa";
    case "consumidor": return "/explorar";
    case "fundacion": return "/fundacion";
    case "admin": return "/empresa";
    default: return "/";
  }
}
