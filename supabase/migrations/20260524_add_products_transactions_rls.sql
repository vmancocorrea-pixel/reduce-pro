-- Policies for products and transactions so authenticated users can publish y reservar productos

-- Productos: lectura pública
DROP POLICY IF EXISTS "products public read" ON public.products;
CREATE POLICY "products public read" ON public.products FOR SELECT
  USING (true);

-- Productos: solo la empresa dueña puede crear, actualizar y eliminar
DROP POLICY IF EXISTS "products insert company owner" ON public.products;
CREATE POLICY "products insert company owner" ON public.products FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "products update company owner" ON public.products;
CREATE POLICY "products update company owner" ON public.products FOR UPDATE
  USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "products delete company owner" ON public.products;
CREATE POLICY "products delete company owner" ON public.products FOR DELETE
  USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

-- Transacciones: el comprador puede crear su reserva
DROP POLICY IF EXISTS "transactions select self or seller" ON public.transactions;
CREATE POLICY "transactions select self or seller" ON public.transactions FOR SELECT
  USING (
    buyer_id = auth.uid()
    OR seller_company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "transactions insert buyer self" ON public.transactions;
CREATE POLICY "transactions insert buyer self" ON public.transactions FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

DROP POLICY IF EXISTS "transactions update self or seller" ON public.transactions;
CREATE POLICY "transactions update self or seller" ON public.transactions FOR UPDATE
  USING (
    buyer_id = auth.uid()
    OR seller_company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  )
  WITH CHECK (
    buyer_id = auth.uid()
    OR seller_company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "transactions delete self or seller" ON public.transactions;
CREATE POLICY "transactions delete self or seller" ON public.transactions FOR DELETE
  USING (
    buyer_id = auth.uid()
    OR seller_company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );
