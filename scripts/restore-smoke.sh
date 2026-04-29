#!/bin/sh
set -eu

CASINO_NAME="$1"
DB_HOST="$2"
DB_PORT="$3"
DB_NAME="$4"
DB_USER="$5"
DB_PASSWORD="$6"
BACKUP_ROOT="$7"

LATEST_FILE="$(ls -1t "${BACKUP_ROOT}/${CASINO_NAME}/${CASINO_NAME}_"*.dump* 2>/dev/null | head -n 1 || true)"

if [ -z "$LATEST_FILE" ]; then
  /app/scripts/notify.sh "error" "Restore smoke failed (${CASINO_NAME})" "No backup file found"
  exit 1
fi

TEST_DB="${DB_NAME}_restore_test"

export PGPASSWORD="$DB_PASSWORD"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS ${TEST_DB};"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE ${TEST_DB};"
unset PGPASSWORD

if ! BACKUP_GPG_PASSPHRASE="${BACKUP_GPG_PASSPHRASE:-}" /app/scripts/restore.sh "$DB_HOST" "$DB_PORT" "$TEST_DB" "$DB_USER" "$DB_PASSWORD" "$LATEST_FILE"; then
  /app/scripts/notify.sh "error" "Restore smoke failed (${CASINO_NAME})" "Restore command failed"
  exit 1
fi

export PGPASSWORD="$DB_PASSWORD"
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$TEST_DB" -tAc "SELECT COUNT(*) FROM users;" >/dev/null; then
  /app/scripts/notify.sh "error" "Restore smoke failed (${CASINO_NAME})" "Validation query failed"
  exit 1
fi
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS ${TEST_DB};"
unset PGPASSWORD

/app/scripts/notify.sh "info" "Restore smoke success (${CASINO_NAME})" "Validated $(basename "$LATEST_FILE")"
echo "Weekly restore smoke test passed for ${CASINO_NAME} using $(basename "$LATEST_FILE")"
