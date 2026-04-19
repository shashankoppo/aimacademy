# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

# Install dependencies needed for Prisma/OpenSSL on Alpine
RUN apk add --no-cache openssl ca-certificates

WORKDIR /app

RUN corepack enable

# Ensure data directory exists
RUN mkdir -p /data

COPY package*.json ./
# Install only production dependencies
RUN npm ci --omit=dev

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Copy Prisma schema and dependencies
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma

# Entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

# Run as root to avoid permission issues with mounted volumes on host
# This is often necessary for SQLite on Ubuntu VPS deployments
USER root

EXPOSE 5000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
