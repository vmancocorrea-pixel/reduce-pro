# Fase 2 — Base de datos, autenticación y roles

Backend ya conectado. Ahora construimos los cimientos de datos y el sistema de cuentas para los 3 actores: **empresas, consumidores y fundaciones**.

## 1. Esquema de base de datos (migración SQL)

Tablas en `public`:

- **profiles** — datos básicos de cada usuario (nombre, teléfono, ciudad, avatar). 1:1 con `auth.users`, creado automáticamente al registrarse vía trigger.
- **user_roles** — tabla separada (enum `app_role`: `empresa | consumidor | fundacion | admin`). Nunca se guarda el rol en `profiles` para evitar escalada de privilegios.
- **companies** — perfil extendido para empresas (razón social, NIT, tipo: supermercado/restaurante/panadería/agroindustria, dirección, geolocalización lat/lng).
- **foundations** — perfil extendido para fundaciones (nombre, NIT, dirección, capacidad de recogida).
- **products** — publicaciones de alimentos (título, descripción, categoría, precio original, precio con descuento, cantidad, unidad, fecha de vencimiento, imágenes, estado: disponible/reservado/vendido/donado, es_donacion bool, lat/lng).
- **transactions** — compras y reservas (producto, comprador, vendedor, cantidad, total, estado, fecha).
- **donations** — donaciones a fundaciones (producto, empresa donante, fundación receptora, estado: solicitada/aprobada/recogida/entregada).
- **notifications** — alertas in-app (usuario, tipo, mensaje, leída).
- **reputation** — calificaciones bidireccionales (de/para, transacción, estrellas 1-5, comentario).

Helpers de seguridad:
- Función `has_role(_user_id, _role)` con `SECURITY DEFINER` para evitar recursión en RLS.
- Función `handle_new_user()` + trigger en `auth.users` para auto-crear `profiles`.
- Trigger `update_updated_at_column()` reutilizable.

**RLS en todas las tablas**, políticas resumidas:
- Cualquiera puede ver productos `disponibles` (catálogo público).
- Empresas solo gestionan **sus** productos/donaciones.
- Consumidores solo ven **sus** transacciones.
- Fundaciones solo ven donaciones donde son receptoras o están disponibles.
- Admin tiene acceso amplio vía `has_role()`.

## 2. Autenticación

- **Email + contraseña** (sin auto-confirm — usuarios deben verificar email).
- **Google Sign-In** vía broker de Lovable Cloud (`lovable.auth.signInWithOAuth`).
- En el formulario de registro, el usuario elige su rol (empresa / consumidor / fundación). Se inserta en `user_roles` tras crear la cuenta.
- Tras login, se redirige según rol:
  - `empresa` → `/empresa` (dashboard placeholder)
  - `consumidor` → `/explorar` (placeholder)
  - `fundacion` → `/fundacion` (placeholder)

## 3. Rutas y componentes nuevos

```text
src/routes/
  login.tsx                       — login (email+pass + Google)
  registro.tsx                    — signup con selector de rol
  _authenticated.tsx              — guard (redirige a /login si no hay sesión)
  _authenticated/empresa.tsx      — dashboard empresa (skeleton)
  _authenticated/explorar.tsx     — vista consumidor (skeleton)
  _authenticated/fundacion.tsx    — vista fundación (skeleton)
src/hooks/use-auth.ts             — hook con sesión + rol activo
src/components/site/Header.tsx    — actualizar: si hay sesión, mostrar avatar+logout
```

- Listener `onAuthStateChange` en `__root.tsx` para invalidar caché en login/logout.
- Router context tipado con `auth: { isAuthenticated, user, role }`.

## 4. Qué NO entra en esta fase
Catálogo completo, geolocalización en mapa, transacciones reales, dashboards con métricas, notificaciones push. Esos vienen en Fases 3+ una vez tengamos cuentas funcionando.

---

## Detalles técnicos
- Toda la lógica sensible (lecturas/escrituras de productos, transacciones) se hará vía `createServerFn` con `requireSupabaseAuth` en fases posteriores. En esta fase, las páginas autenticadas son skeletons con un saludo "Hola, {nombre} ({rol})".
- Google OAuth requiere llamar a `configure_social_auth` para registrar el provider.
- La migración se ejecuta primero y requiere tu aprobación; luego escribo el código.

¿Procedo con la migración + auth tal cual, o quieres ajustar algo (ej. agregar/quitar tablas, cambiar roles, omitir Google)?