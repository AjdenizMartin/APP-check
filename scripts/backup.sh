#!/bin/sh
set -eu

CASINO_NAME="$1"
DB_HOST="$2"
DB_PORT="$3"
DB_NAME="$4"
DB_USER="$5"
DB_PASSWORD="$6"
BACKUP_ROOT="$7"
RETENTION_DAYS="${8:-14}"

notify_fail() {
  /app/scripts/notify.sh "error" "Backup failed (${CASINO_NAME})" "$1"
}

TS="$(date +%F_%H-%M-%S)"
OUT_DIR="${BACKUP_ROOT}/${CASINO_NAME}"
RAW_FILE="${OUT_DIR}/${CASINO_NAME}_${TS}.dump"
FINAL_FILE="$RAW_FILE"

mkdir -p "$OUT_DIR"

if ! export PGPASSWORD="$DB_PASSWORD"; then
  notify_fail "Unable to set DB password env"
  exit 1
fi

if ! pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -F c -f "$RAW_FILE"; then
  notify_fail "pg_dump failed"
  exit 1
fi
unset PGPASSWORD

if [ "${BACKUP_GPG_ENABLED:-false}" = "true" ]; then
  : "${BACKUP_GPG_PASSPHRASE:?BACKUP_GPG_PASSPHRASE is required when BACKUP_GPG_ENABLED=true}"
  if ! gpg --batch --yes --symmetric --cipher-algo AES256 --pinentry-mode loopback --passphrase "$BACKUP_GPG_PASSPHRASE" "$RAW_FILE"; then
    notify_fail "GPG encryption failed"
    exit 1
  fi
  rm -f "$RAW_FILE"
  FINAL_FILE="${RAW_FILE}.gpg"
fi

if [ "${BACKUP_S3_ENABLED:-false}" = "true" ]; then
  : "${BACKUP_S3_BUCKET:?BACKUP_S3_BUCKET is required when BACKUP_S3_ENABLED=true}"
  if ! aws s3 cp "$FINAL_FILE" "s3://${BACKUP_S3_BUCKET}/${CASINO_NAME}/$(basename "$FINAL_FILE")" ${BACKUP_S3_ENDPOINT:+--endpoint-url "$BACKUP_S3_ENDPOINT"}; then
    notify_fail "S3 upload failed"
    exit 1
  fi
fi

find "$OUT_DIR" -type f -name "${CASINO_NAME}_*.dump*" -mtime +"$RETENTION_DAYS" -delete

/app/scripts/notify.sh "info" "Backup success (${CASINO_NAME})" "Created $(basename "$FINAL_FILE")"
echo "Backup created: $FINAL_FILE"
