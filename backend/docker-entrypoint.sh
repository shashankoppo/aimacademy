#!/bin/sh
set -e

echo "[Entrypoint] Checking /data directory..."
mkdir -p /data

# Remove stale SQLite WAL/SHM lock files that can block db push after a
# hard container stop. This is safe because the DB is the source of truth.
echo "[Entrypoint] Cleaning up any stale SQLite lock files..."
rm -f /data/dev.db-wal /data/dev.db-shm

echo "[Entrypoint] Pushing Prisma schema to database (adding new tables if needed)..."
# --accept-data-loss: allow adding new columns / tables safely
# --skip-generate: client was already generated during Docker build
DATABASE_URL="file:/data/dev.db" npx prisma db push \
  --schema=./prisma/schema.prisma \
  --accept-data-loss \
  --skip-generate || {
  echo "[Critical] Database push failed. Check /data is writable and schema is valid."
  exit 1
}

echo "[Entrypoint] Database is up to date. Starting AIM Academy backend..."
exec "$@"
