# PostgreSQL Backup & Restore

## Recommended frequency
- Full backup daily.
- Keep at least 14 days rolling retention.
- Run restore smoke test weekly.

## Where to store backups
- Primary: private S3 bucket with versioning enabled.
- Secondary: encrypted offsite storage.
- Never store only on container local filesystem.

## Backup commands
### Plain SQL backup
```bash
pg_dump -h <HOST> -p <PORT> -U <USER> -d <DB_NAME> > backup_$(date +%F_%H-%M-%S).sql
```

### Compressed custom backup (recommended)
```bash
pg_dump -h <HOST> -p <PORT> -U <USER> -d <DB_NAME> -F c -f backup_$(date +%F_%H-%M-%S).dump
```

## Restore commands
### Restore custom backup
```bash
pg_restore -h <HOST> -p <PORT> -U <USER> -d <DB_NAME> --clean --if-exists --no-owner --no-privileges backup_xxx.dump
```

### Restore plain SQL
```bash
psql -h <HOST> -p <PORT> -U <USER> -d <DB_NAME> < backup_xxx.sql
```

## Restore validation checklist
1. Restore into temporary/test database first.
2. Validate key tables exist and row counts look sane.
3. Run app smoke test against restored DB.
4. Only then promote restored DB for production use.
