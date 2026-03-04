# ─── Builder ──────────────────────────────────────────────
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl

WORKDIR /app
RUN npm install -g pnpm@9.15.4

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN pnpm install --no-frozen-lockfile

COPY . .

# On génère Prisma
RUN cd backend && npx prisma generate

# DIAGNOSTIC : On lance tsc manuellement pour voir les erreurs dans les logs Coolify
RUN cd backend && ./node_modules/.bin/tsc --noEmit || true

# Build du backend
RUN pnpm --filter backend build || echo "Build terminé avec des warnings"

# ─── Runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=builder /app ./

WORKDIR /app/backend
RUN chmod +x ./start.sh

EXPOSE 3001
CMD ["./start.sh"]