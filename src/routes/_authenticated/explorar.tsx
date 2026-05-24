import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/site/Header";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingBag, MapPin, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { supabaseApp as supabase } from "@/lib/supabase-app";

const STORAGE_BUCKET = "product-images";

const formatPrice = (value: number | string | null | undefined) => {
  const number = typeof value === "number" ? value : Number(String(value ?? "").replace(/\D/g, ""));
  if (!number && number !== 0) return "Gratis";
  return `$ ${new Intl.NumberFormat("de-DE").format(number)}`;
};

export const Route = createFileRoute("/_authenticated/explorar")({
  head: () => ({ meta: [{ title: "Explorar — Reduce+" }] }),
  component: ExplorarPage,
});

function ExplorarPage() {
  const { user, role } = useAuth();
  const [products, setProducts] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<"domicilio" | "tienda" | null>(null);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      // Avoid nested relationship select because the schema cache may not expose the FK relationship cleanly.
      const { data: productData, error: productsError } = await supabase
        .from("products")
        .select(
          `id, title, description, category, quantity, unit, original_price, discount_price, expires_at, is_donation, company_id, status, created_at, images`
        )
        .eq("status", "disponible")
        .order("created_at", { ascending: false });

      if (productsError) {
        console.error("Error loading products:", productsError);
        toast.error(productsError.message ?? "Error cargando productos");
        setProducts([]);
        setLoading(false);
        return;
      }

      const companyIds = Array.from(new Set((productData ?? []).map((product: any) => product.company_id).filter(Boolean)));
      let companiesById: Record<string, string> = {};

      if (companyIds.length > 0) {
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("id, legal_name")
          .in("id", companyIds);

        if (companyError) {
          console.error("Error loading companies for products:", companyError);
        } else {
          companiesById = (companyData ?? []).reduce((acc: Record<string, string>, company: any) => {
            if (company?.id) acc[company.id] = company.legal_name;
            return acc;
          }, {});
        }
      }

      setProducts(
        (productData ?? []).map((product: any) => ({
          ...product,
          company_name: companiesById[product.company_id] ?? "Anónimo",
          image_url: product.images?.[0]
            ? supabase.storage.from(STORAGE_BUCKET).getPublicUrl(product.images[0]).data.publicUrl
            : null,
        }))
      );
      setLoading(false);
    };

    void load();
  }, [user]);

  const handleApply = (product: any) => {
    setSelectedProduct(product);
    setDeliveryMethod(null);
  };

  const handleConfirmApply = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para aplicar");
      return;
    }
    if (!selectedProduct || !deliveryMethod) {
      toast.error("Por favor selecciona un método de entrega");
      return;
    }

    setApplyingId(selectedProduct.id);
    const total = selectedProduct.discount_price ?? selectedProduct.original_price ?? 0;

    const { error } = await supabase.from("transactions").insert({
      product_id: selectedProduct.id,
      buyer_id: user.id,
      seller_company_id: selectedProduct.company_id,
      quantity: 1,
      total,
      status: "pendiente",
      delivery_method: deliveryMethod,
    });

    if (error) {
      toast.error(`No se pudo aplicar al producto: ${error.message}`);
      setApplyingId(null);
      return;
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({ status: "reservado" })
      .eq("id", selectedProduct.id);

    if (updateError) {
      toast.error("Producto reservado, pero no se pudo actualizar el estado");
    } else {
      toast.success(`Te has postulado al producto. Entrega: ${deliveryMethod === "domicilio" ? "Domicilio" : "Recoger en tienda"}`);
    }

    setApplyingId(null);
    setProducts((current) => current.filter((item) => item.id !== selectedProduct.id));
    setSelectedProduct(null);
    setDeliveryMethod(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground">
            <ShoppingBag className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold">Explorar productos</h1>
            <p className="text-sm text-muted-foreground">Hola, {user?.email} · rol: {role ?? "—"}</p>
          </div>
        </div>

        <div className="grid gap-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando productos...</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay productos disponibles en este momento.</p>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => (
                <div key={product.id} className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold">{product.title}</div>
                      <div className="text-sm text-muted-foreground">{product.category || "Sin categoría"}</div>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{product.is_donation ? "Donación" : "Disponible"}</span>
                  </div>
                  {product.image_url ? (
                    <div className="mt-4 overflow-hidden rounded-3xl bg-muted">
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="h-48 w-full object-contain object-center"
                        loading="lazy"
                      />
                    </div>
                  ) : null}
                  <p className="mt-4 text-sm text-muted-foreground">{product.description || "Sin descripción"}</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-muted-foreground">
                    <div>Empresa: {product.company_name || "Anónimo"}</div>
                    <div>Cantidad: {product.quantity} {product.unit}</div>
                    <div>Precio: {formatPrice(product.discount_price ?? product.original_price)}</div>
                    <div>Vence: {product.expires_at ? new Date(product.expires_at).toLocaleDateString() : "No aplica"}</div>
                  </div>
                  <Button
                    variant="hero"
                    className="mt-6"
                    onClick={() => handleApply(product)}
                  >
                    Aplicar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <AlertDialog open={Boolean(selectedProduct)} onOpenChange={(open) => !open && (setSelectedProduct(null), setDeliveryMethod(null))}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar solicitud</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Cómo deseas recibir el producto?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-3 py-4">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-accent" htmlFor="domicilio">
                <input
                  id="domicilio"
                  type="radio"
                  name="delivery"
                  value="domicilio"
                  checked={deliveryMethod === "domicilio"}
                  onChange={() => setDeliveryMethod("domicilio")}
                  className="h-4 w-4"
                />
                <div>
                  <div className="font-semibold">Entregar a domicilio</div>
                  <div className="text-sm text-muted-foreground">Te lo enviamos a tu dirección</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-accent" htmlFor="tienda">
                <input
                  id="tienda"
                  type="radio"
                  name="delivery"
                  value="tienda"
                  checked={deliveryMethod === "tienda"}
                  onChange={() => setDeliveryMethod("tienda")}
                  className="h-4 w-4"
                />
                <div>
                  <div className="font-semibold">Recoger en tienda</div>
                  <div className="text-sm text-muted-foreground">Lo retiras en el local</div>
                </div>
              </label>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => void handleConfirmApply()}
                disabled={!deliveryMethod || applyingId === selectedProduct?.id}
              >
                {applyingId === selectedProduct?.id ? "Aplicando..." : "Confirmar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
