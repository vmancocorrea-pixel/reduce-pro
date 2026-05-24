import { createFileRoute } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/site/Header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Store, Package, BarChart3, HeartHandshake } from "lucide-react";
import { supabaseApp as supabase } from "@/lib/supabase-app";

export const Route = createFileRoute("/_authenticated/empresa")({
  head: () => ({ meta: [{ title: "Panel empresa — Reduce+" }] }),
  component: EmpresaDashboard,
});

function EmpresaDashboard() {
  const { user, role } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [products, setProducts] = useState<Array<any>>([]);
  const [applications, setApplications] = useState<Array<any>>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("unidad");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isDonation, setIsDonation] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const STORAGE_BUCKET = "product-images";

  const formatCurrencyInput = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    return `$ ${new Intl.NumberFormat("de-DE").format(Number(digits))}`;
  };

  const parseCurrencyValue = (value: string) => {
    const digits = value.replace(/\D/g, "");
    return digits ? Number(digits) : 0;
  };

  const formatPrice = (value: number | string | null | undefined) => {
    const number = typeof value === "number" ? value : parseCurrencyValue(String(value ?? ""));
    if (!number && number !== 0) return "Gratis";
    return `$ ${new Intl.NumberFormat("de-DE").format(number)}`;
  };

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("id, user_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (companyError) {
        console.error("Error loading company:", companyError);
        toast.error(companyError.message ?? "Error cargando empresa");
        setLoading(false);
        return;
      }

      let currentCompanyId = company?.id;
      if (!currentCompanyId) {
        const { data: insertedCompany, error: insertError } = await supabase
          .from("companies")
          .insert({
            user_id: user.id,
            legal_name: user.email ?? "Mi empresa",
            company_type: "otro",
          })
          .select("id")
          .single();

        if (insertError) {
          toast.error("Error creando datos de empresa");
          setLoading(false);
          return;
        }

        currentCompanyId = insertedCompany.id;
      }

      setCompanyId(currentCompanyId);
      console.debug("Empresa cargada, id=", currentCompanyId);

      const { data: companyProducts, error: productsError } = await supabase
        .from("products")
        .select(
          `id, title, description, category, quantity, unit, original_price, discount_price, expires_at, is_donation, company_id, status, created_at, images`
        )
        .eq("company_id", currentCompanyId)
        .order("created_at", { ascending: false });

      if (productsError) {
        console.error("Error loading company products:", productsError);
        toast.error(productsError.message ?? "Error cargando productos");
        setProducts([]);
      } else {
        setProducts(
          (companyProducts ?? []).map((product: any) => ({
            ...product,
            image_url: product.images?.[0]
              ? supabase.storage.from(STORAGE_BUCKET).getPublicUrl(product.images[0]).data.publicUrl
              : null,
          })),
        );
      }

      const { data: transactionData, error: transactionsError } = await supabase
        .from("transactions")
        .select("id, product_id, buyer_id, quantity, total, status, created_at")
        .eq("seller_company_id", currentCompanyId)
        .order("created_at", { ascending: false });

      if (transactionsError) {
        console.error("Error loading company transactions:", transactionsError);
        setApplications([]);
      } else {
        const productIds = Array.from(
          new Set((transactionData ?? []).map((transaction: any) => transaction.product_id).filter(Boolean))
        );

        let productTitlesById: Record<string, string> = {};
        if (productIds.length > 0) {
          const { data: productTitles, error: titlesError } = await supabase
            .from("products")
            .select("id, title")
            .in("id", productIds);

          if (titlesError) {
            console.error("Error loading transaction product titles:", titlesError);
          } else {
            productTitlesById = (productTitles ?? []).reduce((acc: Record<string, string>, product: any) => {
              if (product?.id) acc[product.id] = product.title;
              return acc;
            }, {});
          }
        }

        const buyerIds = Array.from(
          new Set((transactionData ?? []).map((t: any) => t.buyer_id).filter(Boolean))
        );

        let buyersById: Record<string, string> = {};
        if (buyerIds.length > 0) {
          const { data: buyerProfiles, error: buyersError } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", buyerIds);

          if (buyersError) {
            console.error("Error loading buyer profiles:", buyersError);
          } else {
            buyersById = (buyerProfiles ?? []).reduce((acc: Record<string, string>, p: any) => {
              if (p?.id) acc[p.id] = p.full_name ?? p.id;
              return acc;
            }, {});
          }
        }

        setApplications(
          (transactionData ?? []).map((transaction: any) => ({
            ...transaction,
            product_title: productTitlesById[transaction.product_id] ?? "Producto desconocido",
            buyer_name: buyersById[transaction.buyer_id] ?? transaction.buyer_id,
          }))
        );
      }

      setLoading(false);
    };

    void load();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) {
      toast.error("Empresa no encontrada");
      return;
    }
    setSaving(true);

    let images: string[] | undefined;
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop() ?? "jpg";
      const filePath = `${companyId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, imageFile, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        console.error("Error uploading product image:", uploadError);
        toast.error(uploadError.message ?? "No se pudo subir la imagen");
        setSaving(false);
        return;
      }

      images = [uploadData.path];
    }

    const { error } = await supabase.from("products").insert({
      company_id: companyId,
      title,
      description: description || null,
      category: category || null,
      quantity,
      unit: unit || "unidad",
      original_price: (() => {
        const parsed = parseCurrencyValue(price);
        return parsed > 0 ? parsed : null;
      })(),
      discount_price: (() => {
        const parsed = parseCurrencyValue(discount);
        return parsed > 0 ? parsed : null;
      })(),
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      is_donation: isDonation,
      status: "disponible",
      images: images ?? [],
    });

    if (error) {
      toast.error(`No se pudo publicar el producto: ${error.message}`);
      setSaving(false);
      return;
    }

    toast.success("Producto publicado correctamente");
    setTitle("");
    setDescription("");
    setCategory("");
    setQuantity(1);
    setUnit("unidad");
    setPrice("");
    setDiscount("");
    setExpiresAt("");
    setIsDonation(false);
    setImageFile(null);

    const { data: companyProducts, error: productsError } = await supabase
      .from("products")
      .select(
        `id, title, description, category, quantity, unit, original_price, discount_price, expires_at, is_donation, company_id, status, created_at, images`
      )
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (productsError) {
      console.error("Error refreshing products:", productsError);
      toast.error(productsError.message ?? "Error actualizando lista de productos");
      setProducts([]);
    } else {
      setProducts(
        (companyProducts ?? []).map((product: any) => ({
          ...product,
          image_url: product.images?.[0]
            ? supabase.storage.from(STORAGE_BUCKET).getPublicUrl(product.images[0]).data.publicUrl
            : null,
        })),
      );
    }

    setSaving(false);
  };

  const handleAccept = async (application: any) => {
    if (!companyId) {
      toast.error("Empresa no encontrada");
      return;
    }
    setProcessingId(application.id);

    // Confirm transaction
    const { error: txError } = await supabase
      .from("transactions")
      .update({ status: "confirmada" })
      .eq("id", application.id);

    if (txError) {
      console.error("Error confirming transaction:", txError);
      toast.error(txError.message ?? "No se pudo confirmar la solicitud");
      setProcessingId(null);
      return;
    }

    // Mark product as sold
    const { error: prodError } = await supabase
      .from("products")
      .update({ status: "vendido" })
      .eq("id", application.product_id);

    if (prodError) {
      console.error("Error updating product status:", prodError);
      toast.error(prodError.message ?? "No se pudo actualizar el estado del producto");
    }

    setApplications((cur) => cur.map((a) => (a.id === application.id ? { ...a, status: "confirmada" } : a)));
    setProducts((cur) => cur.map((p) => (p.id === application.product_id ? { ...p, status: "vendido" } : p)));
    toast.success("Solicitud confirmada");
    setProcessingId(null);
  };

  const handleReject = async (application: any) => {
    if (!companyId) {
      toast.error("Empresa no encontrada");
      return;
    }
    setProcessingId(application.id);

    // Cancel transaction
    const { error: txError } = await supabase
      .from("transactions")
      .update({ status: "cancelada" })
      .eq("id", application.id);

    if (txError) {
      console.error("Error cancelling transaction:", txError);
      toast.error(txError.message ?? "No se pudo rechazar la solicitud");
      setProcessingId(null);
      return;
    }

    // Re-open product
    const { error: prodError } = await supabase
      .from("products")
      .update({ status: "disponible" })
      .eq("id", application.product_id);

    if (prodError) {
      console.error("Error updating product status:", prodError);
      toast.error(prodError.message ?? "No se pudo actualizar el estado del producto");
    }

    setApplications((cur) => cur.map((a) => (a.id === application.id ? { ...a, status: "cancelada" } : a)));
    setProducts((cur) => cur.map((p) => (p.id === application.product_id ? { ...p, status: "disponible" } : p)));
    toast.success("Solicitud rechazada");
    setProcessingId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground">
            <Store className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold">Panel de empresa</h1>
            <p className="text-sm text-muted-foreground">Hola, {user?.email} · rol: {role ?? "—"}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
          <section className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <h2 className="text-xl font-semibold mb-4">Publicar nuevo producto</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input id="quantity" type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unit">Unidad</Label>
                  <Input id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="expiresAt">Fecha de vencimiento</Label>
                  <Input id="expiresAt" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Precio original</Label>
                  <Input
                    id="price"
                    type="text"
                    inputMode="numeric"
                    value={price}
                    placeholder="$ 0"
                    onChange={(e) => setPrice(formatCurrencyInput(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="discount">Precio con descuento</Label>
                  <Input
                    id="discount"
                    type="text"
                    inputMode="numeric"
                    value={discount}
                    placeholder="$ 0"
                    onChange={(e) => setDiscount(formatCurrencyInput(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="image">Foto del producto</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="flex items-center gap-3">
                <input id="donation" type="checkbox" checked={isDonation} onChange={(e) => setIsDonation(e.target.checked)} className="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
                <Label htmlFor="donation" className="!mb-0">Es donación</Label>
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Publicando..." : "Publicar producto"}
              </Button>
            </form>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <h2 className="text-xl font-semibold mb-4">Tus productos</h2>
            {loading ? (
              <p className="text-sm text-muted-foreground">Cargando productos...</p>
            ) : products.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tienes productos publicados aún.</p>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold">{product.title}</div>
                        <div className="text-sm text-muted-foreground">{product.category || "Sin categoría"}</div>
                      </div>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{product.status}</span>
                    </div>
                    {product.image_url ? (
                      <div className="mt-4 overflow-hidden rounded-3xl bg-muted">
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="h-44 w-full object-contain object-center"
                          loading="lazy"
                        />
                      </div>
                    ) : null}
                    <div className="mt-2 text-sm text-muted-foreground">{product.description || "Sin descripción"}</div>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span>Cantidad: {product.quantity}</span>
                      <span>Unidad: {product.unit}</span>
                      <span>Precio: {formatPrice(product.discount_price ?? product.original_price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] mt-8">
          <h2 className="text-xl font-semibold mb-4">Solicitudes recibidas</h2>
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando solicitudes...</p>
          ) : applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no hay solicitudes de consumidores.</p>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application.id} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold">{application.product_title}</div>
                      <div className="text-sm text-muted-foreground">Cantidad solicitada: {application.quantity}</div>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{application.status}</span>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">Total: {application.total}</div>
                  <div className="mt-2 text-sm text-muted-foreground">Comprador: {application.buyer_name || application.buyer_id}</div>
                  <div className="mt-2 text-xs text-muted-foreground">Aplicado: {new Date(application.created_at).toLocaleString()}</div>
                  {application.status === "pendiente" && (
                    <div className="mt-4 flex items-center gap-3">
                      <Button variant="default" onClick={() => void handleAccept(application)} disabled={processingId === application.id}>
                        {processingId === application.id ? "Procesando..." : "Aceptar"}
                      </Button>
                      <Button variant="destructive" onClick={() => void handleReject(application)} disabled={processingId === application.id}>
                        {processingId === application.id ? "Procesando..." : "Rechazar"}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
