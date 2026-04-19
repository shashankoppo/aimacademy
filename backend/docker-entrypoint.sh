#!/bin/sh
set -e

# Wait for a brief moment to ensure system is ready
echo "[Entrypoint] Checking /data directory..."
mkdir -p /data

echo "[Entrypoint] Running Prisma migrations..."
# Since prisma is now in dependencies, we don't need to install it at runtime
npx prisma migrate deploy --schema=./prisma/schema.prisma || {
  echo "[Critical] Migration failed. Ensure /data is writable and DATABASE_URL is correct."
  exit 1
}

echo "[Entrypoint] Starting AIM Academy backend..."
exec "$@"
