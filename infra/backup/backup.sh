#!/bin/bash

# Backup script for Clínica SaaS
# Usage: ./backup.sh

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="${DB_NAME:-clinica_saas}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"

mkdir -p "$BACKUP_DIR"

echo "Starting backup at $TIMESTAMP..."

# PostgreSQL backup
echo "Backing up database..."
pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_DIR/db_$TIMESTAMP.sql"

# Compress
echo "Compressing..."
gzip "$BACKUP_DIR/db_$TIMESTAMP.sql"

# Files backup
echo "Backing up uploads..."
tar -czf "$BACKUP_DIR/uploads_$TIMESTAMP.tar.gz" apps/api/uploads/ 2>/dev/null || true

echo "Backup complete: db_$TIMESTAMP.sql.gz"
ls -lh "$BACKUP_DIR"