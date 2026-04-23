# App+ (Casino Reception Operations)

MVP application for small casino reception operations: customer check-in/check-out, customer management, private photos, daily history, and audit trails.

## Milestones

### Phase 0 - Technical Validation
- Stack finalized: Next.js 15 + TypeScript + Tailwind CSS + Auth.js + Prisma + PostgreSQL.
- Technical decisions documented in `docs/technical-decisions.md`.
- Key risks resolved:
  - One active visit per customer via unique partial index in PostgreSQL.
  - Private images via authorized backend endpoint (no permanent public URLs).

### Phase 1 - Base Scaffold
- Modular structure created:
  - `src/app/(auth)`, `src/app/(dashboard)`, `src/app/api`
  - `src/modules/*`, `src/lib/*`, `src/components/*`, `src/tests/*`
- Base operational UI for reception.

### Phase 2 - Database & Domain
- Complete Prisma schema in `prisma/schema.prisma`.
- Initial migration SQL in `prisma/migrations/0001_init/migration.sql`.
- Initial seed data in `prisma/seed.ts`.

### Phase 3 - Auth & Authorization
- Auth.js with credentials provider and roles (`ADMIN`, `SUPERVISOR`, `EMPLOYEE`) in `src/auth.ts`.
- Protected routes via middleware and per-endpoint backend authorization.

### Phase 4 - Customer Module
- Base customer CRUD:
  - `GET/POST /api/customers`
  - `GET/PATCH /api/customers/[customerId]`
  - Quick search by name/phone/code.
  - Floating side panel with profile, photos, and recent history.
  - ID/Face photo upload and replacement:
    - `POST /api/customer-assets/upload`
    - `GET /api/customer-assets/[assetId]/view`

### Phase 5 - Visits Module
- Check-in: `POST /api/visits`
- Check-out + transactional financial record: `POST /api/visits/checkout`
- Operational daily history with filters.
- Financial correction with reason (Supervisor/Admin): `POST /api/visits/financials/correct`

### Phase 6 - Audit & Sensitive Actions
- Audit logging for sensitive actions:
  - Customer create/update
  - Asset upload/replace
  - Check-in/check-out
  - Financial correction
  - Global force checkout
  - Administrative user changes
- Role-based audit view:
  - ADMIN: full access
  - SUPERVISOR: partial access
  - Route: `/dashboard/audit`
- Global force checkout (Supervisor/Admin): `POST /api/visits/force-checkout-all`

### Phase 7 - Minimum Quality
- Typecheck, lint, unit tests, and build verified.
- Playwright smoke test included.

## Admin Features
- User and role management (ADMIN): `/dashboard/admin/users`
- User APIs:
  - `GET/POST /api/users`
  - `PATCH /api/users/[userId]`

## Stack
- Frontend: Next.js 15, React, TypeScript strict
- UI: Tailwind CSS + shadcn-style base components in `src/components/ui`
- Forms: React Hook Form + Zod
- Backend: App Router + Route Handlers
- ORM: Prisma
- DB: PostgreSQL
- Auth: Auth.js (credentials)
- Storage: S3-compatible abstraction + private local fallback
- Observability: Sentry structure + custom logger
- Testing: Vitest + Playwright smoke tests

## Requirements
- Node.js 22+
- npm 10+
- PostgreSQL 15+

## Quick Local Start

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

2. Start PostgreSQL (optional with Docker):
   ```bash
   docker compose up -d
   ```

3. Generate Prisma client:
   ```bash
   npm run db:generate
   ```

4. Apply migrations:
   ```bash
   npm run db:migrate
   ```

5. Seed the database:
   ```bash
   npm run db:seed
   ```

6. Run the app:
   ```bash
   npm run dev
   ```

## Seed Credentials
- admin@appplus.local / `SEED_DEFAULT_PASSWORD` (default: `Change123!`)
- supervisor@appplus.local / `SEED_DEFAULT_PASSWORD`
- employee@appplus.local / `SEED_DEFAULT_PASSWORD`

## Useful Scripts
- `npm run dev`
- `npm run build`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run test:e2e`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:seed`

## Implemented Tests (Minimum Required)
- No duplicate active visits allowed
- Check-out correctly records financial data
- Force checkout closes all active visits
- Permissions enforced by role
- Financial correction requires appropriate role
- Access to sensitive data restricted
