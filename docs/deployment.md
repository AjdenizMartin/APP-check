# Production Deployment Guide

## 1) CI and Deploy Workflows
- CI: `.github/workflows/ci.yml`
  - Runs on pull requests and pushes to `main`.
  - Executes: `npm ci`, `prisma generate`, `prisma migrate deploy`, `lint`, `typecheck`, `test`, `build`.
- Deploy: `.github/workflows/deploy.yml`
  - Safe template for production.
  - Uses `prisma migrate deploy` (never `migrate dev`).
  - Triggered by `workflow_dispatch` in production environment.

## 2) Required GitHub Secrets (Production)
Set these in GitHub repository settings > Secrets and variables > Actions:

- `PROD_DATABASE_URL`
- `PROD_AUTH_SECRET`
- `PROD_STORAGE_DRIVER` (must be `s3` in production)
- `PROD_S3_BUCKET`
- `PROD_S3_REGION`
- `PROD_S3_ENDPOINT` (empty if AWS native)
- `PROD_S3_ACCESS_KEY_ID`
- `PROD_S3_SECRET_ACCESS_KEY`
- `PROD_SENTRY_DSN` (optional but recommended)

## 3) Migration Policy
- Development only: `npm run db:migrate` (`prisma migrate dev`).
- Production only: `npm run db:migrate:deploy` (`prisma migrate deploy`).

This prevents schema drift and unsafe migration generation in production.

## 4) Storage Persistence
- `STORAGE_DRIVER=local` is **not valid for production containers** because container filesystems are ephemeral.
- Use `STORAGE_DRIVER=s3` with S3-compatible object storage.

Required env variables for S3 mode:
- `S3_BUCKET`
- `S3_REGION`
- `S3_ENDPOINT`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- Optional: `S3_FORCE_PATH_STYLE`

## 5) Deployment Verification Checklist
1. Healthcheck returns 200: `GET /api/health`.
2. Upload customer image and verify retrieval works after app restart.
3. Run one check-in/check-out flow and verify audit entries.
4. Confirm logs and Sentry events appear in monitoring.
