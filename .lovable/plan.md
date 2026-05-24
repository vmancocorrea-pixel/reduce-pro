
## Contexto y limitación importante

Lovable Cloud ya está activado y **no se puede desactivar**. Estos archivos son **auto-generados** por la plataforma y se sobrescriben si los editamos:

- `src/integrations/supabase/client.ts`, `client.server.ts`, `auth-attacher.ts`, `auth-middleware.ts`, `types.ts`
- `.env`, `supabase/config.toml`

Por eso creamos un **cliente paralelo** propio y migramos el código para usarlo.

---

## Decisiones confirmadas

- ✅ Tú ejecutas el SQL en tu Supabase (`cwfvrabcswkkgxrywiyd`).
- ✅ **Google OAuth se desactiva.** Solo email + password.
- ✅ Asumes la pérdida del broker de Lovable y la integración nativa.

---

## Plan de implementación

### 1. Cliente Supabase propio
- `src/lib/supabase-app.ts` — exporta `supabaseApp` apuntando a tu URL `https://cwfvrabcswkkgxrywiyd.supabase.co` con tu publishable key hardcodeada. `storageKey` distinto al de Cloud para aislar sesiones.

### 2. Reemplazo de imports
En estos archivos, cambiar `from "@/integrations/supabase/client"` → `from "@/lib/supabase-app"` (alias `supabaseApp as supabase`):
- `src/hooks/use-auth.ts`
- `src/routes/__root.tsx`
- `src/routes/_authenticated.tsx`
- `src/routes/login.tsx`
- `src/routes/registro.tsx`
- `src/components/site/Header.tsx`

### 3. Eliminar Google OAuth
- Quitar botón "Continuar con Google" y la función `onGoogle` en `login.tsx` y `registro.tsx`.
- Quitar import de `@/integrations/lovable` en ambos archivos.
- Quitar la lógica de `pending_role` / `sessionStorage` en `registro.tsx` y `_authenticated.tsx` (ya no hace falta sin OAuth).

### 4. SQL para tu Supabase
Generar `/mnt/documents/migrations-export.sql` con:
- Enums: `app_role`, `company_type`, `product_status`, `transaction_status`, `donation_status`
- 9 tablas con sus columnas y defaults: `profiles`, `user_roles`, `companies`, `foundations`, `products`, `transactions`, `donations`, `notifications`, `reputation`
- Funciones `has_role`, `handle_new_user`, `update_updated_at_column`
- Trigger `on_auth_user_created` sobre `auth.users`
- Triggers `update_*_updated_at` en las tablas con `updated_at`
- Todas las RLS policies actuales

Tú lo pegas en el SQL Editor de tu Supabase.

### 5. Configuración manual en tu dashboard de Supabase
- Authentication → URL Configuration → añadir tus dominios de preview/producción a **Redirect URLs** y **Site URL**.
- Authentication → Providers → asegurar que **Email** está habilitado, **Google** deshabilitado.
- Si NO quieres confirmación por email durante pruebas: Authentication → Providers → Email → desactivar "Confirm email".

---

## Lo que queda inutilizado (sin tocar)
- Archivos auto-generados de Lovable Cloud (siguen ahí pero ya no se importan).
- Server functions con `requireSupabaseAuth` (no estamos usando ninguna actualmente).
- `src/integrations/lovable/index.ts` (broker de OAuth, sin uso tras quitar Google).

---

## Recordatorios
- **Rota la contraseña de tu DB** en el dashboard de Supabase — la pegaste en chat.
- La publishable key (`sb_publishable_...`) es pública, no hay riesgo en commitearla.
- En el futuro, si necesitas server-side logic con tu Supabase, habrá que crear un middleware paralelo apuntando a tus credenciales.
