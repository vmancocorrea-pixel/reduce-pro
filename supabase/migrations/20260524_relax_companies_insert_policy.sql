-- Relax companies INSERT policy so the authenticated user can create their company record
-- This makes the WITH CHECK only verify the owner is the auth user (no role check).

DROP POLICY IF EXISTS "companies insert self" ON public.companies;
CREATE POLICY "companies insert self" ON public.companies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Keep update/delete restrictions as-is (only owner can update/delete)
DROP POLICY IF EXISTS "companies update own" ON public.companies;
CREATE POLICY "companies update own" ON public.companies FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "companies delete own" ON public.companies;
CREATE POLICY "companies delete own" ON public.companies FOR DELETE
  USING (auth.uid() = user_id);
