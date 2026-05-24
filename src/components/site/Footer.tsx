import { Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="container mx-auto px-4 py-12 grid gap-8 md:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-bold text-lg">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[image:var(--gradient-primary)] text-primary-foreground">
              <Leaf className="h-4 w-4" />
            </span>
            Reduce<span className="text-primary">+</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Alimentos con propósito. Reducimos el desperdicio conectando empresas, consumidores y fundaciones.
          </p>
        </div>
        <FooterCol title="Producto" items={["Para empresas", "Para consumidores", "Para fundaciones", "Precios"]} />
        <FooterCol title="Compañía" items={["Sobre nosotros", "Impacto", "Blog", "Contacto"]} />
        <FooterCol title="Legal" items={["Términos", "Privacidad", "Cookies"]} />
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Reduce+. Hecho con propósito en Colombia.
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="font-semibold text-sm text-foreground mb-3">{title}</h4>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {items.map((i) => (
          <li key={i}><a href="#" className="hover:text-foreground transition-colors">{i}</a></li>
        ))}
      </ul>
    </div>
  );
}
