# Operations Hardening Guide

## 1) Deployment model
- Run Athlone and Mullingar as isolated stacks.
- Each casino has independent Postgres and app runtime.
- No shared DB, no shared users table, no cross-casino leakage by design.

## 2) Dev vs Production compose
- Development: `docker-compose.yml` (same as `docker-compose.dev.yml`)
- Production: `docker-compose.prod.yml` + `.env.prod`

## 3) Critical security settings
- Use long random `AUTH_SECRET` per casino.
- Use strong DB passwords per casino.
- Never commit `.env`, `.env.prod`, or secrets.
- Keep `STORAGE_DRIVER=s3` in production for private images if possible.

## 4) Safe startup order
- Postgres containers have healthchecks.
- App waits on healthy DB via `depends_on.condition=service_healthy`.

## 5) Migration policy
- Development may use `prisma migrate dev`.
- Production should use reviewed SQL migrations and controlled deploy window.
- Always back up DB before applying migrations.

## 6) Backup basics
- Daily `pg_dump` per casino DB.
- Keep at least 7-14 rolling backups.
- Test restore monthly.

## 7) Monitoring and logs
- Wire `SENTRY_DSN` in production.
- Keep container logs (app + postgres) and rotation policy.

## 8) Recovery checklist
1. Stop affected app container.
2. Confirm DB health and disk space.
3. Restore last known-good backup into a new DB.
4. Point app to restored DB.
5. Validate login, active visits, and history pages.


## 9) Backup automation
- Backup services are included in compose for Athlone and Mullingar.
- They execute one backup every 24h and keep 14 days by default.
- Backup path: `/app/backups/<casino>/`.
- You can run an immediate manual backup with:
  `docker compose -f docker-compose.dev.yml exec backup_athlone /app/scripts/backup.sh athlone postgres_athlone 5432 appplus_athlone postgres postgres /app/backups 14`


## 10) Encryption + Offsite + Restore Verification
- Enable GPG encryption for backups at rest.
- Upload encrypted backups to private S3 bucket for offsite recovery.
- Run weekly restore smoke test automatically against temporary DB.
- Alerting: wire container logs to your monitoring stack and alert on any non-zero exit.


Alert webhook:
- Set `ALERT_WEBHOOK_URL` to receive backup/restore success and failure notifications.
