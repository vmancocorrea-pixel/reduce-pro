import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { useAuth } from "@/hooks/use-auth";
import { HeartHandshake, Package, Truck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/fundacion")({
  head: () => ({ meta: [{ title: "Panel fundación — Reduce+" }] }),
  component: FundacionDashboard,
});

function FundacionDashboard() {
  const { user, role } = useAuth();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground">
            <HeartHandshake className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold">Panel de fundación</h1>
            <p className="text-sm text-muted-foreground">Hola, {user?.email} · rol: {role ?? "—"}</p>
          </div>
        </div>
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          {[
            { icon: Package, label: "Donaciones disponibles", desc: "Pronto" },
            { icon: Truck, label: "Recogidas programadas", desc: "Pronto" },
            { icon: HeartHandshake, label: "Entregas", desc: "Pronto" },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-border bg-card p-6">
              <c.icon className="h-6 w-6 text-primary mb-3" />
              <div className="font-semibold">{c.label}</div>
              <div className="text-sm text-muted-foreground mt-1">{c.desc}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
