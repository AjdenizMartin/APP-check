# Rollback Plan

## 1) Rollback application version
1. Identify the last known-good release image/tag/commit.
2. Redeploy that version using your deployment platform.
3. Verify:
   - `/api/health` is healthy
   - login works
   - check-in/check-out works

## 2) Revert misconfigured environment variables
1. Open production environment variable manager.
2. Revert changed variables to last known-good values.
3. Restart app.
4. Validate `/api/health` and smoke flows.

Critical variables to verify:
- `DATABASE_URL`
- `AUTH_SECRET`
- `STORAGE_DRIVER`
- `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
- `SENTRY_DSN`

## 3) Database rollback / restore (if required)
Use the latest verified backup from before incident.

1. Put app in maintenance/read-only mode (if available).
2. Restore DB to a new restore target first.
3. Validate schema + key tables (`users`, `customers`, `visits`).
4. Switch app to restored DB.
5. Run smoke test.

See: `docs/backup-restore.md`.

## 4) If storage fails (S3 outage or bad credentials)
1. Verify credentials and endpoint.
2. Confirm bucket policy and object permissions.
3. Validate write/read with a test object.
4. If still failing, freeze image uploads and keep core check-in/check-out online.
5. Restore storage config from previous known-good values.

## 5) Incident response ownership
- Incident commander: ____
- Backend owner: ____
- DevOps owner: ____
- Business owner: ____
