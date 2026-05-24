import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Store, ShoppingBag, HeartHandshake, Leaf, TrendingDown, Globe2, Sparkles, ArrowRight, MapPin, Bell, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import heroFood from "@/assets/hero-food.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Reduce+ — Alimentos con propósito" },
      { name: "description", content: "Marketplace sostenible que conecta empresas, consumidores y fundaciones para reducir el desperdicio alimentario." },
      { property: "og:title", content: "Reduce+ — Alimentos con propósito" },
      { property: "og:description", content: "Compra, vende y dona alimentos próximos a vencer. Impacto económico, social y ambiental." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <Stats />
        <Roles />
        <HowItWorks />
        <Impact />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      <div className="container mx-auto px-4 py-20 md:py-28 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Economía circular para alimentos
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
            Alimentos con <span className="text-primary">propósito</span>.<br />
            Cero desperdicio.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Conectamos supermercados, restaurantes y panaderías con consumidores y fundaciones para vender o donar alimentos próximos a vencer en buen estado.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="hero" size="xl">
              Explorar productos cerca <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="xl">Soy una empresa</Button>
          </div>
          <div className="flex items-center gap-6 pt-2 text-sm text-muted-foreground">
            <div><strong className="text-foreground">+12.000</strong> kg recuperados</div>
            <div className="h-4 w-px bg-border" />
            <div><strong className="text-foreground">350+</strong> empresas activas</div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-[image:var(--gradient-primary)] opacity-20 blur-2xl" />
          <img
            src={heroFood}
            alt="Alimentos frescos rescatados del desperdicio"
            width={1536}
            height={1024}
            className="relative rounded-3xl shadow-[var(--shadow-elevated)] aspect-[4/3] object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    { value: "30%", label: "del alimento producido se desperdicia" },
    { value: "9.7M ton", label: "perdidas al año en Colombia" },
    { value: "2.5 kg CO₂", label: "evitados por cada kg rescatado" },
  ];
  return (
    <section className="border-y border-border/60 bg-card">
      <div className="container mx-auto px-4 py-12 grid sm:grid-cols-3 gap-8">
        {items.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary">{s.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Roles() {
  const roles = [
    {
      id: "empresas",
      icon: Store,
      title: "Empresas",
      desc: "Supermercados, restaurantes, panaderías y agroindustrias. Publica excedentes, recupera ingresos y reduce desperdicio.",
      bullets: ["Publica productos con descuento", "Dashboard de métricas e ingresos", "Donaciones a fundaciones aliadas"],
    },
    {
      id: "consumidores",
      icon: ShoppingBag,
      title: "Consumidores",
      desc: "Encuentra alimentos en buen estado cerca de ti, a precios increíbles. Ahorra y reduce huella ambiental.",
      bullets: ["Geolocalización y filtros", "Reservas y compras seguras", "Alertas y favoritos"],
    },
    {
      id: "fundaciones",
      icon: HeartHandshake,
      title: "Fundaciones",
      desc: "Accede a donaciones de comercios, coordina recogidas y rastrea entregas para tu comunidad.",
      bullets: ["Catálogo de donaciones", "Solicitudes de recogida", "Seguimiento de entregas"],
    },
  ];
  return (
    <section className="container mx-auto px-4 py-20 md:py-28">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">Una plataforma, tres propósitos</h2>
        <p className="mt-3 text-muted-foreground">Diseñada para crear valor a lo largo de toda la cadena alimentaria.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {roles.map((r) => (
          <div
            key={r.id}
            id={r.id}
            className="group rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1 transition-[var(--transition-smooth)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground mb-5">
              <r.icon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">{r.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{r.desc}</p>
            <ul className="mt-5 space-y-2">
              {r.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm">
                  <Leaf className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground/80">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const features = [
    { icon: MapPin, title: "Geolocalización", desc: "Productos cerca de ti, en tiempo real." },
    { icon: Bell, title: "Alertas inteligentes", desc: "Avisos automáticos de vencimiento y ofertas." },
    { icon: BarChart3, title: "Dashboard analítico", desc: "Métricas de impacto, ventas y ahorro de CO₂." },
    { icon: HeartHandshake, title: "Donaciones simples", desc: "Conecta excedentes con fundaciones en un clic." },
  ];
  return (
    <section className="bg-secondary/40 border-y border-border/60">
      <div className="container mx-auto px-4 py-20 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Funcionalidades pensadas para escalar</h2>
          <p className="mt-3 text-muted-foreground">Construido con buenas prácticas: seguro, escalable y listo para producción.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl bg-card border border-border p-6 hover:border-primary/40 transition-colors">
              <f.icon className="h-6 w-6 text-primary mb-3" />
              <h3 className="font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Impact() {
  const items = [
    { icon: TrendingDown, value: "−40%", label: "desperdicio promedio por empresa" },
    { icon: Leaf, value: "12.4 ton", label: "alimentos rescatados este mes" },
    { icon: Globe2, value: "31 ton", label: "CO₂ evitado este mes" },
  ];
  return (
    <section id="impacto" className="container mx-auto px-4 py-20 md:py-28">
      <div className="rounded-3xl bg-[image:var(--gradient-primary)] p-10 md:p-14 text-primary-foreground shadow-[var(--shadow-elevated)]">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold">Impacto medible, no promesas</h2>
          <p className="mt-3 text-primary-foreground/85">
            Cada compra y cada donación generan un impacto cuantificable en kilos rescatados, CO₂ evitado y comunidades alimentadas.
          </p>
        </div>
        <div className="mt-10 grid sm:grid-cols-3 gap-6">
          {items.map((i) => (
            <div key={i.label} className="rounded-2xl bg-white/10 backdrop-blur p-6 border border-white/15">
              <i.icon className="h-6 w-6 mb-3" />
              <div className="text-3xl font-bold">{i.value}</div>
              <div className="text-sm text-primary-foreground/80 mt-1">{i.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="container mx-auto px-4 pb-24 text-center">
      <h2 className="text-3xl md:text-4xl font-bold">Únete al movimiento Reduce+</h2>
      <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
        Empieza hoy a transformar el desperdicio en oportunidad. Gratis para empezar.
      </p>
      <div className="mt-7 flex flex-wrap gap-3 justify-center">
        <Button variant="hero" size="xl">Crear cuenta gratis</Button>
        <Button variant="outline" size="xl">Hablar con ventas</Button>
      </div>
    </section>
  );
}
