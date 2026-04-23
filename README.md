# App+ (MVP interno casino)

MVP serio para operacion de recepcion en casino pequeno: check-in/check-out, clientes, fotos privadas, historial y auditoria.

## Estado por fases

### FASE 0 - Validacion tecnica previa
- Stack fijado: Next.js 15 + TypeScript + Tailwind + Auth.js + Prisma + PostgreSQL.
- Decisiones tecnicas en `docs/technical-decisions.md`.
- Riesgos claves resueltos:
  - una sola visita activa por cliente via indice unico parcial en PostgreSQL.
  - imagenes privadas via endpoint backend autorizado (no URL publica permanente).

### FASE 1 - Scaffold base
- Estructura modular creada:
  - `src/app/(auth)`, `src/app/(dashboard)`, `src/app/api`
  - `src/modules/*`, `src/lib/*`, `src/components/*`, `src/tests/*`
- UI operativa base para recepcion.

### FASE 2 - Base de datos y dominio
- Prisma schema completo en `prisma/schema.prisma`.
- Migracion inicial SQL en `prisma/migrations/0001_init/migration.sql`.
- Seed inicial en `prisma/seed.ts`.

### FASE 3 - Auth y autorizacion
- Auth.js con credenciales y roles (`ADMIN`, `SUPERVISOR`, `EMPLOYEE`) en `src/auth.ts`.
- Rutas protegidas por middleware y autorizacion backend por endpoint.

### FASE 4 - Modulo clientes
- CRUD base de clientes:
  - `GET/POST /api/customers`
  - `GET/PATCH /api/customers/[customerId]`
- Busqueda rapida por nombre/telefono/codigo.
- Panel lateral (ficha flotante) con datos, fotos e historial reciente.
- Subida y reemplazo de foto ID/rostro:
  - `POST /api/customer-assets/upload`
  - `GET /api/customer-assets/[assetId]/view`

### FASE 5 - Modulo visitas
- Check-in: `POST /api/visits`
- Check-out + financiero transaccional: `POST /api/visits/checkout`
- Historial diario operativo con filtros.
- Correccion financiera con motivo (Supervisor/Admin): `POST /api/visits/financials/correct`

### FASE 6 - Auditoria y acciones sensibles
- Auditoria en acciones sensibles:
  - create/update de cliente
  - upload/reemplazo de asset
  - check-in/check-out
  - correccion financiera
  - force checkout global
  - cambios administrativos de usuarios
- Vista auditoria por rol:
  - ADMIN: completa
  - SUPERVISOR: parcial
  - ruta: `/dashboard/audit`
- Force checkout global (Supervisor/Admin): `POST /api/visits/force-checkout-all`

### FASE 7 - Calidad minima
- Typecheck, lint, unit tests y build verificados.
- Playwright smoke test base incluido.

## Funcionalidades administrativas
- Gestion de usuarios y roles (ADMIN): `/dashboard/admin/users`
- API de usuarios:
  - `GET/POST /api/users`
  - `PATCH /api/users/[userId]`

## Stack
- Frontend: Next.js 15, React, TypeScript strict
- UI: Tailwind CSS + componentes base estilo shadcn en `src/components/ui`
- Forms: React Hook Form + Zod
- Backend: App Router + Route Handlers
- ORM: Prisma
- DB: PostgreSQL
- Auth: Auth.js (credentials)
- Storage: abstraccion S3-compatible + fallback local privado
- Observabilidad: estructura Sentry + logger
- Testing: Vitest + Playwright smoke

## Requisitos
- Node.js 22+
- npm 10+
- PostgreSQL 15+

## Arranque local rapido

1. Copiar variables:
```bash
cp .env.example .env
```

2. Levantar Postgres (opcional con Docker):
```bash
docker compose up -d
```

3. Generar Prisma client:
```bash
npm run db:generate
```

4. Aplicar migraciones:
```bash
npm run db:migrate
```

5. Seed:
```bash
npm run db:seed
```

6. Ejecutar app:
```bash
npm run dev
```

## Credenciales seed
- admin@appplus.local / `SEED_DEFAULT_PASSWORD` (default: `Change123!`)
- supervisor@appplus.local / `SEED_DEFAULT_PASSWORD`
- employee@appplus.local / `SEED_DEFAULT_PASSWORD`

## Scripts utiles
- `npm run dev`
- `npm run build`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run test:e2e`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:seed`

## Pruebas implementadas (minimo solicitado)
- no permitir doble visita activa
- check-out correcto con financiero
- force checkout cierra visitas activas
- permisos por rol
- correccion financiera requiere rol adecuado
- acceso a datos sensibles restringido
