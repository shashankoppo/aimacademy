# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-bullseye-slim AS builder

WORKDIR /app

RUN corepack enable

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM node:20-bullseye-slim AS runtime

# Install wget and openssl (Debian slim doesn't include wget by default)
RUN apt-get update && apt-get install -y openssl ca-certificates wget && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN corepack enable

# Ensure data directory exists
RUN mkdir -p /data

# Copy package files and Prisma schema FIRST
COPY package*.json ./
COPY prisma ./prisma

# Install production dependencies and explicitly generate the client 
# This ensures all query/migration engines are correctly downloaded for this stage
RUN npm ci --omit=dev && npx prisma generate

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

# Use root to avoid permission overhead with host-mounted SQLite volumes
USER root

EXPOSE 5000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
