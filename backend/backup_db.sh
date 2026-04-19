#!/usr/bin/env bash
# backup_db.sh — dump the Inventus PostgreSQL database to a timestamped file.
#
# Usage:
#   chmod +x backup_db.sh
#   ./backup_db.sh               # uses values from .env
#   BACKUP_DIR=/mnt/backups ./backup_db.sh

set -euo pipefail

# Load .env if present
ENV_FILE="$(dirname "$0")/.env"
if [[ -f "$ENV_FILE" ]]; then
  # export only DB_* and PGPASSWORD lines; skip comments and blank lines
  set -o allexport
  # shellcheck disable=SC1090
  source <(grep -E '^(DB_|PGPASSWORD)' "$ENV_FILE" | sed 's/ *= */=/')
  set +o allexport
fi

DB_NAME="${DB_NAME:-inventus}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_DIR="${BACKUP_DIR:-$(dirname "$0")/backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.dump"

mkdir -p "$BACKUP_DIR"

# Pass password via env var so pg_dump doesn't prompt
export PGPASSWORD="${DB_PASSWORD:-}"

echo "Backing up database '${DB_NAME}' → ${BACKUP_FILE}"
pg_dump \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --username="$DB_USER" \
  --format=custom \
  --file="$BACKUP_FILE" \
  "$DB_NAME"

echo "Backup complete: $BACKUP_FILE"

# Restore with:
#   pg_restore --host=... --port=... --username=... --dbname=inventus --clean backup.dump
