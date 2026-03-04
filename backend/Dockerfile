# ─── Builder ──────────────────────────────────────────────
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl

WORKDIR /app
RUN npm install -g pnpm@9.15.4

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN pnpm install --no-frozen-lockfile

COPY backend/ ./backend/

# Generate Prisma client and build NestJS
RUN cd backend && npx prisma generate
RUN pnpm --filter backend build

# ─── Runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=builder /app ./

WORKDIR /app/backend
RUN chmod +x ./start.sh

EXPOSE 3001
CMD ["./start.sh"]
