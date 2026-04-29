#!/bin/sh
set -eu

LEVEL="$1"
TITLE="$2"
MESSAGE="$3"

WEBHOOK_URL="${ALERT_WEBHOOK_URL:-}"
if [ -z "$WEBHOOK_URL" ]; then
  exit 0
fi

PAYLOAD="{\"level\":\"${LEVEL}\",\"title\":\"${TITLE}\",\"message\":\"${MESSAGE}\",\"service\":\"appplus-backup\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}"

curl -sS -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" >/dev/null || true
