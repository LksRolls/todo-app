FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY backend/package.json ./package.json
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/ ./backend/

WORKDIR /app/backend
RUN pnpm install --frozen-lockfile
RUN pnpm prisma generate
RUN pnpm build

# ─── Runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN npm install -g pnpm

COPY --from=builder /app/backend/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/prisma ./prisma
COPY --from=builder /app/backend/node_modules/.prisma ./node_modules/.prisma

COPY backend/start.sh ./
RUN chmod +x start.sh

EXPOSE 3001
CMD ["./start.sh"]
