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
    await navigate({ to: roleHome(role) });
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
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      {/* Fondo con imagen de alimentos saludables */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1400&h=900&fit=crop')",
        }}
      />

      {/* Overlay oscuro para mejorar legibilidad con imagen */}
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-black/40 via-black/50 to-black/60 backdrop-blur-sm" />

      {/* Header/Navbar */}
      <div className="relative z-20">
        <Header />
      </div>

      {/* Contenedor principal centrado */}
      <div className="relative z-20 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        {/* Card con efecto glassmorphism premium */}
        <div className="w-full max-w-md backdrop-blur-2xl bg-white/[0.08] border border-white/20 rounded-3xl p-8 sm:p-10 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-white/[0.12] hover:border-white/30">
          
          {/* Encabezado */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Iniciar sesión</h1>
            <p className="mt-3 text-sm sm:text-base text-white/70">Accede para gestionar tus productos o reservas.</p>
          </div>

          {/* Formulario */}
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-white">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.08] border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:bg-white/[0.12] focus:border-white/30 transition-all duration-200"
              />
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-white">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.08] border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:bg-white/[0.12] focus:border-white/30 transition-all duration-200"
              />
            </div>

            {/* Botón Ingresar */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold text-base shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-green-600 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>

          {/* Divisor */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs sm:text-sm text-white/50 font-medium">O</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Link Crear Cuenta */}
          <p className="text-center text-sm sm:text-base text-white/70">
            ¿Aún no tienes cuenta?{" "}
            <Link
              to="/registro"
              className="font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors duration-200"
            >
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
