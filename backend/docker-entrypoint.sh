#!/bin/sh
set -e

echo "[Entrypoint] Checking /data directory..."
if [ ! -d "/data" ]; then
  mkdir -p /data
fi
touch /data/.permcheck && rm /data/.permcheck || echo "[Warning] /data is not writable. This will cause Prisma to fail."

echo "[Entrypoint] Running Prisma migrations..."
# Check if prisma exists in node_modules
if [ ! -f "./node_modules/.bin/prisma" ]; then
  echo "[Debug] Prisma binary not found in node_modules, installing..."
  npm install prisma @prisma/client
fi

npx prisma migrate deploy --schema=./prisma/schema.prisma || {
  echo "[Critical] Migration failed. Check logs above."
  exit 1
}

echo "[Entrypoint] Starting AIM Academy backend..."
exec "$@"
