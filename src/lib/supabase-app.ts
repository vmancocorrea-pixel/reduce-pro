import { createClient } from "@supabase/supabase-js";

// Cliente paralelo apuntando al Supabase propio del usuario.
// Sin tipos de Database porque el schema vive en otro proyecto Supabase,
// distinto al que genera src/integrations/supabase/types.ts.
const SUPABASE_URL = "https://cwfvrabcswkkgxrywiyd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_2XXK8CFVEPsaGDVPBMh0pA_dZosFi_i";

export const supabaseApp = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    storageKey: "reduceplus-auth",
    persistSession: true,
    autoRefreshToken: true,
  },
}) as any;

