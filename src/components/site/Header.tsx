import { Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[image:var(--gradient-primary)] text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </span>
          Reduce<span className="text-primary">+</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#empresas" className="hover:text-foreground transition-colors">Empresas</a>
          <a href="#consumidores" className="hover:text-foreground transition-colors">Consumidores</a>
          <a href="#fundaciones" className="hover:text-foreground transition-colors">Fundaciones</a>
          <a href="#impacto" className="hover:text-foreground transition-colors">Impacto</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Iniciar sesión</Button>
          <Button variant="hero" size="sm">Comenzar</Button>
        </div>
      </div>
    </header>
  );
}
