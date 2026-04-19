#!/bin/sh
set -e

# Wait for a brief moment to ensure system is ready
echo "[Entrypoint] Checking /data directory..."
mkdir -p /data

echo "[Entrypoint] Pushing Prisma schema to database..."
# The project has no migration history files, so we must use 'db push'
# to ensure tables are created dynamically on the first run.
npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss || {
  echo "[Critical] Database initialization failed. Ensure /data is writable."
  exit 1
}

echo "[Entrypoint] Starting AIM Academy backend..."
exec "$@"
