# App+ Technical Decisions (FASE 0)

Date: 2026-04-23

## 1) Stack exacto

- Frontend: Next.js 15 (App Router) + React + TypeScript strict
- UI: Tailwind CSS + componentes estilo shadcn/ui (en `src/components/ui`)
- Formularios: React Hook Form + Zod
- Backend: Route Handlers y Server Actions puntuales
- ORM: Prisma
- DB: PostgreSQL
- Auth: Auth.js (NextAuth v5 beta) con credenciales
- Storage: abstraccion S3-compatible con fallback local privado para desarrollo
- Observabilidad: logger estructurado + placeholders de Sentry
- Testing: Vitest (unit/integration base) + Playwright (smoke base)

## 2) Estructura de carpetas

Se adopta estructura modular en `src/` separando `modules`, `lib`, `components` y rutas App Router.

## 3) Entidades principales

- users
- customers
- customer_assets
- visits
- visit_financials
- closure_events
- audit_logs
- app_settings

## 4) Orden de implementacion

1. FASE 1: scaffold y cimientos de arquitectura
2. FASE 2: Prisma schema, migracion inicial y seed
3. FASE 3: autenticacion/autorizacion por roles
4. FASE 4: base modulo de clientes (CRUD + busqueda + assets)
5. FASE 5+: visitas, force checkout, auditoria detallada y pruebas

## 5) Riesgos y decisiones por ambiguedad

- Restriccion de "una visita activa por cliente": se resuelve con indice unico parcial en PostgreSQL (`WHERE status='ACTIVE'`).
- Imagenes privadas: nunca se expone key directa; acceso via endpoint backend autorizado.
- `WIN`/`LOSS`: perspectiva del cliente.
- Moneda por defecto: EUR.
- `EMPLOYEE` puede subir fotos pero visualizacion sensible depende de `app_settings.allow_employee_view_sensitive_images`.
- Si S3 no esta configurado, se usa almacenamiento local privado en `.data/storage` para MVP local.
