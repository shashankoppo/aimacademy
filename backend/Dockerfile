FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app

RUN corepack enable

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./

EXPOSE 5000
CMD ["npm", "start"]
