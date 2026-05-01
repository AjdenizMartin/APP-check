# LuxeLedger (Casino Reception Operations)

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

2. Start with Docker (two independent casinos):
   ```bash
   docker compose up -d postgres_athlone app_athlone postgres_mullingar app_mullingar
   ```

   Access each casino independently:
   - Athlone: `http://localhost:3001`
   - Mullingar: `http://localhost:3002`

   Optional: run only one casino instance:
   ```bash
   docker compose up -d postgres_athlone app_athlone
   # or
   docker compose up -d postgres_mullingar app_mullingar
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

## Multi-Casino (Athlone + Mullingar)

### Development
Run both isolated stacks:
```bash
docker compose -f docker-compose.dev.yml up -d
```

URLs:
- Athlone: `http://localhost:3001`
- Mullingar: `http://localhost:3002`

Stop:
```bash
docker compose -f docker-compose.dev.yml down
```

### Production
1. Create env file from template:
```bash
cp .env.prod.example .env.prod
```
2. Fill strong secrets/passwords.
3. Start:
```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

See hardening guide: `docs/operations-hardening.md`.


## Daily Backups
- Automatic backup containers run once every 24 hours for each casino DB.
- Output folder: `./backups/athlone` and `./backups/mullingar`
- Default retention: 14 days (`BACKUP_RETENTION_DAYS`).

Run backups services (dev):
```bash
docker compose -f docker-compose.dev.yml up -d backup_athlone backup_mullingar
```

Manual restore examples:
```bash
./scripts/restore.sh localhost 5433 appplus_athlone postgres postgres ./backups/athlone/athlone_YYYY-MM-DD_HH-MM-SS.dump
./scripts/restore.sh localhost 5434 appplus_mullingar postgres postgres ./backups/mullingar/mullingar_YYYY-MM-DD_HH-MM-SS.dump
```


### Encrypted backups + S3 + weekly restore verification
Set in `.env.prod` (or compose env):
- `BACKUP_GPG_ENABLED=true`
- `BACKUP_GPG_PASSPHRASE=<strong-secret>`
- `BACKUP_S3_ENABLED=true`
- `BACKUP_S3_BUCKET=<private-bucket>`
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

Services:
- `backup_athlone`, `backup_mullingar`: daily encrypted backups + optional S3 upload
- `backup_verify_athlone`, `backup_verify_mullingar`: weekly restore smoke test

Run all backup services:
```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d backup_athlone backup_mullingar backup_verify_athlone backup_verify_mullingar
```


Alert webhook:
- Set `ALERT_WEBHOOK_URL` to receive backup/restore success and failure notifications.


## Security Configuration Notes
- App validates critical environment variables at startup/build (fail-fast).
- Required: `DATABASE_URL` and (`AUTH_SECRET` or `NEXTAUTH_SECRET`).
- If `SENTRY_ENABLED=true` or `SENTRY_DSN` is set, `SENTRY_DSN` is required.
- If `STORAGE_DRIVER=s3`, required: `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`.
- `STORAGE_DRIVER=local` is only for local development and is not recommended for production containers.


## QA Commands
- Type check: `npm run typecheck`
- Lint: `npm run lint`
- Unit tests: `npm run test`
- E2E smoke tests: `npm run test:e2e`

### E2E prerequisites
1. Start app and DB (seeded):
   - `npm run db:generate`
   - `npm run db:migrate`
   - `npm run db:seed`
   - `npm run dev`
2. Optional env overrides:
   - `E2E_ADMIN_EMAIL` (default: `admin@appplus.local`)
   - `E2E_ADMIN_PASSWORD` (default: `SEED_DEFAULT_PASSWORD` or `Change123!`)
   - `PLAYWRIGHT_BASE_URL` (default: `http://127.0.0.1:3000`)

### Covered smoke flows
- Login correcto
- Crear cliente + check-in
- Check-out de cliente activo
- Force checkout global


## CI/CD
- CI workflow: `.github/workflows/ci.yml` (PR + push to `main`).
- Production deploy template: `.github/workflows/deploy.yml` (manual dispatch, safe migration flow).
- Production migration command: `npm run db:migrate:deploy` (uses `prisma migrate deploy`).
- Full deployment docs: `docs/deployment.md`.

Storage note for production:
- `STORAGE_DRIVER=local` is not suitable for production containers. Use `STORAGE_DRIVER=s3`.
