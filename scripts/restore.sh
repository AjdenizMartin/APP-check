#!/bin/sh
set -eu

DB_HOST="$1"
DB_PORT="$2"
DB_NAME="$3"
DB_USER="$4"
DB_PASSWORD="$5"
BACKUP_FILE="$6"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup file not found: $BACKUP_FILE"
  exit 1
fi

RESTORE_INPUT="$BACKUP_FILE"
TMP_FILE=""

if echo "$BACKUP_FILE" | grep -q '\\.gpg$'; then
  : "${BACKUP_GPG_PASSPHRASE:?BACKUP_GPG_PASSPHRASE is required to restore encrypted backups}"
  TMP_FILE="/tmp/restore_$(date +%s).dump"
  gpg --batch --yes --decrypt --pinentry-mode loopback --passphrase "$BACKUP_GPG_PASSPHRASE" -o "$TMP_FILE" "$BACKUP_FILE"
  RESTORE_INPUT="$TMP_FILE"
fi

export PGPASSWORD="$DB_PASSWORD"
pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --clean --if-exists --no-owner --no-privileges "$RESTORE_INPUT"
unset PGPASSWORD

if [ -n "$TMP_FILE" ] && [ -f "$TMP_FILE" ]; then
  rm -f "$TMP_FILE"
fi

echo "Restore completed from: $BACKUP_FILE"
