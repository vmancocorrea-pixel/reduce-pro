import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Cliente paralelo apuntando al Supabase propio del usuario.
// No editar — si necesitas cambiar el proyecto, actualiza estas constantes.
const SUPABASE_URL = "https://cwfvrabcswkkgxrywiyd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_2XXK8CFVEPsaGDVPBMh0pA_dZosFi_i";

export const supabaseApp = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    storageKey: "reduceplus-auth",
    persistSession: true,
    autoRefreshToken: true,
  },
});
