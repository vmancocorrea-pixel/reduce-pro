-- Function to assign role to user (bypasses RLS for signup flow)
CREATE OR REPLACE FUNCTION public.assign_user_role(p_user_id UUID, p_user_role app_role)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Only allow role assignment for the current user or if current user is admin
  IF auth.uid() = p_user_id OR public.has_role(auth.uid(), 'admin') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (p_user_id, p_user_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END; $$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.assign_user_role(uuid, app_role) TO authenticated;

-- Also update the INSERT policy to allow anon users (during signup)
DROP POLICY IF EXISTS "roles insert self once" ON public.user_roles;
CREATE POLICY "roles insert self anon" ON public.user_roles FOR INSERT
  WITH CHECK (role <> 'admin');
