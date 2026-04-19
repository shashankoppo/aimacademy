#!/bin/sh
set -e

# Ensure the /data directory exists and has correct permissions
# (This is a safety check in case host volume mounting messes with it)
echo "[Entrypoint] Checking /data permissions..."
# Since we run as 'node' user, we might not be able to chown, 
# so we check if we can write to it.
touch /data/.permcheck && rm /data/.permcheck || echo "[Warning] /data might not be writable by node user"

echo "[Entrypoint] Running Prisma migrations..."
# Use --accept-data-loss for sqlite if needed, but 'migrate deploy' is safer for production
npx prisma migrate deploy --schema=./prisma/schema.prisma || {
  echo "[Critical] Migration failed. Check if DATABASE_URL is correct and /data is writable."
  exit 1
}

echo "[Entrypoint] Generating Prisma Client..."
npx prisma generate --schema=./prisma/schema.prisma

echo "[Entrypoint] Starting AIM Academy backend..."
exec "$@"
