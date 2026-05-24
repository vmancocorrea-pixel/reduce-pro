import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Store, ShoppingBag, HeartHandshake } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/site/Header";
import { supabaseApp as supabase } from "@/lib/supabase-app";
import { roleHome, type AppRole } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/registro")({
  head: () => ({
    meta: [
      { title: "Crear cuenta — Reduce+" },
      { name: "description", content: "Únete a Reduce+ como empresa, consumidor o fundación." },
    ],
  }),
  component: SignupPage,
});

const ROLES: { id: AppRole; label: string; desc: string; icon: typeof Store }[] = [
  { id: "consumidor", label: "Consumidor", desc: "Compra alimentos cerca a precios bajos.", icon: ShoppingBag },
  { id: "empresa", label: "Empresa", desc: "Publica excedentes y reduce desperdicio.", icon: Store },
  { id: "fundacion", label: "Fundación", desc: "Recibe donaciones para tu comunidad.", icon: HeartHandshake },
];

function SignupPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<AppRole>("consumidor");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: fullName },
      },
    });
    if (error) { setLoading(false); toast.error(error.message); return; }
    const userId = data.user?.id;
    if (userId) {
      // Use the SECURITY DEFINER function to bypass RLS during signup
      const { error: roleErr } = await supabase.rpc("assign_user_role", {
        p_user_id: userId,
        p_user_role: role,
      });
      if (roleErr) {
        console.error("Error assigning role:", roleErr);
        setLoading(false);
        toast.error(`Error al asignar rol: ${roleErr.message}`);
        return;
      }
    }
    setLoading(false);
    toast.success("Cuenta creada. Revisa tu correo para confirmar.");
    if (data.session) navigate({ to: roleHome(role) });
    else navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
          <h1 className="text-2xl font-bold">Crear cuenta</h1>
          <p className="mt-1 text-sm text-muted-foreground">Elige tu rol y empieza en segundos.</p>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all",
                  role === r.id
                    ? "border-primary bg-primary/5 shadow-[var(--shadow-soft)]"
                    : "border-border hover:border-primary/40"
                )}
              >
                <r.icon className="h-5 w-5 text-primary mb-2" />
                <div className="text-sm font-semibold">{r.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{r.desc}</div>
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-4 mt-6">
            <div>
              <Label htmlFor="name">Nombre completo</Label>
              <Input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? "Creando..." : "Crear cuenta"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta? <Link to="/login" className="text-primary font-medium">Inicia sesión</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
