import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/site/Header";
import { supabaseApp as supabase } from "@/lib/supabase-app";
import { roleHome, type AppRole } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — Reduce+" },
      { name: "description", content: "Accede a tu cuenta de Reduce+ para vender, comprar o donar alimentos." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectByRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles").select("role").eq("user_id", userId).limit(1).maybeSingle();
    const role = (data?.role as AppRole | undefined) ?? null;
    navigate({ to: roleHome(role) });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Bienvenido de vuelta");
    if (data.user) await redirectByRole(data.user.id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
          <h1 className="text-2xl font-bold">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-muted-foreground">Accede para gestionar tus productos o reservas.</p>

          <form onSubmit={onSubmit} className="space-y-4 mt-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿Aún no tienes cuenta? <Link to="/registro" className="text-primary font-medium">Crear cuenta</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
