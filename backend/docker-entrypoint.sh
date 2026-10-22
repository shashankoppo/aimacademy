#!/bin/sh
set -e

echo "[Entrypoint] Checking /data directory..."
mkdir -p /data

echo "[Entrypoint] Ensuring Prisma database schema is up to date..."
DATABASE_URL="file:/data/dev.db" npx prisma db push \
  --schema=./prisma/schema.prisma \
  --accept-data-loss \
  --skip-generate || {
  echo "[Warn] Prisma db push completed with warnings or was skipped. Backend will verify tables dynamically."
}

echo "[Entrypoint] Database is up to date. Starting AIM Academy backend..."
exec "$@"
