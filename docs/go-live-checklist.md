# Go-Live Checklist

Release date: ____
Owner: ____
Environment: Production

## Build and quality gates
- [ ] `npm ci` completed
- [ ] `npm run lint` OK (no errors)
- [ ] `npm run typecheck` OK
- [ ] `npm run test` OK
- [ ] `npm run test:e2e` core flows OK
- [ ] `npm run build` OK

## Database and migrations
- [ ] `npm run db:migrate:deploy` tested in staging
- [ ] Production migration plan approved
- [ ] Backup taken immediately before migration

## Runtime health and observability
- [ ] `/api/health` returns 200 and `database: up`
- [ ] `/api/health` returns 503 when DB is intentionally unavailable (staging test)
- [ ] Sentry configured (`SENTRY_DSN`) and receiving server errors
- [ ] Structured JSON logs visible in log platform
- [ ] Sensitive actions are logged: login, check-in, check-out, force checkout, customer edit

## Security checks
- [ ] No secrets hardcoded in repo
- [ ] No sensitive data in logs (photos, IDs, DATABASE_URL, AUTH_SECRET)
- [ ] Private routes require auth
- [ ] Critical APIs return 401/403 as expected

## Storage and backups
- [ ] `STORAGE_DRIVER=s3` in production (not local)
- [ ] S3 bucket permissions validated (private)
- [ ] Upload + retrieval survive app restart
- [ ] Daily backups enabled
- [ ] Weekly restore smoke verification enabled

## Rollback readiness
- [ ] Previous app version artifact/tag identified
- [ ] Rollback steps validated (`docs/rollback.md`)
- [ ] DB restore procedure validated (`docs/backup-restore.md`)

## Sign-off
- QA Lead: ____
- Backend Lead: ____
- DevOps: ____
- Product/Owner: ____
