#!/bin/bash

# Restore script for Clínica SaaS
# Usage: ./restore.sh backup_file.sql.gz

set -e

if [ -z "$1" ]; then
  echo "Usage: ./restore.sh <backup_file.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"
DB_NAME="${DB_NAME:-clinica_saas}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"

echo "Restoring from $BACKUP_FILE..."

gunzip -c "$BACKUP_FILE" | psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME"

echo "Restore complete!"