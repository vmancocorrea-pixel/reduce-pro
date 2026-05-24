
-- Enum de roles
CREATE TYPE public.app_role AS ENUM ('empresa', 'consumidor', 'fundacion', 'admin');
CREATE TYPE public.company_type AS ENUM ('supermercado', 'restaurante', 'panaderia', 'agroindustria', 'tienda', 'otro');
CREATE TYPE public.product_status AS ENUM ('disponible', 'reservado', 'vendido', 'donado', 'expirado');
CREATE TYPE public.transaction_status AS ENUM ('pendiente', 'confirmada', 'completada', 'cancelada');
CREATE TYPE public.donation_status AS ENUM ('solicitada', 'aprobada', 'recogida', 'entregada', 'cancelada');

-- Trigger genérico de updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  city TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Helper SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Auto-crear profile al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- companies
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  legal_name TEXT NOT NULL,
  nit TEXT,
  company_type company_type NOT NULL DEFAULT 'otro',
  address TEXT,
  city TEXT,
  lat NUMERIC,
  lng NUMERIC,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_companies_updated BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- foundations
CREATE TABLE public.foundations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  nit TEXT,
  address TEXT,
  city TEXT,
  pickup_capacity_kg NUMERIC,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.foundations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_foundations_updated BEFORE UPDATE ON public.foundations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  original_price NUMERIC(10,2),
  discount_price NUMERIC(10,2),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit TEXT DEFAULT 'unidad',
  expires_at TIMESTAMPTZ,
  images TEXT[] DEFAULT '{}',
  status product_status NOT NULL DEFAULT 'disponible',
  is_donation BOOLEAN NOT NULL DEFAULT false,
  lat NUMERIC,
  lng NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_company ON public.products(company_id);
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products ON DELETE RESTRICT,
  buyer_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  seller_company_id UUID NOT NULL REFERENCES public.companies ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  total NUMERIC(10,2) NOT NULL,
  status transaction_status NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_transactions_updated BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- donations
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products ON DELETE RESTRICT,
  donor_company_id UUID NOT NULL REFERENCES public.companies ON DELETE CASCADE,
  foundation_id UUID REFERENCES public.foundations ON DELETE SET NULL,
  status donation_status NOT NULL DEFAULT 'solicitada',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_donations_updated BEFORE UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- reputation
CREATE TABLE public.reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions ON DELETE SET NULL,
  stars SMALLINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reputation ENABLE ROW LEVEL SECURITY;

-- ============ RLS POLICIES ============

-- profiles
CREATE POLICY "profiles select self or admin" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles update self" ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
CREATE POLICY "profiles insert self" ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- user_roles
CREATE POLICY "roles view self or admin" ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "roles insert self once" ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id AND role <> 'admin');
CREATE POLICY "roles admin manage" ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- companies
CREATE POLICY "companies public read" ON public.companies FOR SELECT USING (true);
CREATE POLICY "companies insert self" ON public.companies FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'empresa'));
CREATE POLICY "companies update own" ON public.companies FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "companies delete own" ON public.companies FOR DELETE
  USING (auth.uid() = user_id);

-- foundations
CREATE POLICY "foundations public read" ON public.foundations FOR SELECT USING (true);
CREATE POLICY "foundations insert self" ON public.foundations FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'fundacion'));
CREATE POLICY "foundations update own" ON public.foundations FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "foundations delete own" ON public.foundations FOR DELETE
  USING (auth.uid() = user_id);

-- products
CREATE POLICY "products public read available" ON public.products FOR SELECT
  USING (status = 'disponible' OR EXISTS (
    SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.user_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "products company insert" ON public.products FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.user_id = auth.uid()
  ));
CREATE POLICY "products company update" ON public.products FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.user_id = auth.uid()
  ));
CREATE POLICY "products company delete" ON public.products FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.user_id = auth.uid()
  ));

-- transactions
CREATE POLICY "transactions view own" ON public.transactions FOR SELECT
  USING (auth.uid() = buyer_id OR EXISTS (
    SELECT 1 FROM public.companies c WHERE c.id = seller_company_id AND c.user_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "transactions buyer insert" ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "transactions update parties" ON public.transactions FOR UPDATE
  USING (auth.uid() = buyer_id OR EXISTS (
    SELECT 1 FROM public.companies c WHERE c.id = seller_company_id AND c.user_id = auth.uid()
  ));

-- donations
CREATE POLICY "donations view parties" ON public.donations FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.companies c WHERE c.id = donor_company_id AND c.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.foundations f WHERE f.id = foundation_id AND f.user_id = auth.uid())
    OR foundation_id IS NULL
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "donations donor insert" ON public.donations FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.companies c WHERE c.id = donor_company_id AND c.user_id = auth.uid()
  ));
CREATE POLICY "donations parties update" ON public.donations FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.companies c WHERE c.id = donor_company_id AND c.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.foundations f WHERE f.id = foundation_id AND f.user_id = auth.uid())
  );

-- notifications
CREATE POLICY "notifications view own" ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "notifications update own" ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- reputation
CREATE POLICY "reputation public read" ON public.reputation FOR SELECT USING (true);
CREATE POLICY "reputation insert as from" ON public.reputation FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);
