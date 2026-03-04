FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN pnpm install --frozen-lockfile

COPY backend/ ./backend/
RUN pnpm --filter backend exec prisma generate
RUN pnpm --filter backend build

# Utilisation de pnpm deploy pour isoler le backend et ses deps de prod
RUN pnpm --filter backend deploy --prod /prod/backend

# ─── Runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app/backend

# On récupère le déploiement isolé (contient node_modules et package.json)
COPY --from=builder /prod/backend ./
# On récupère le build NestJS et Prisma
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/prisma ./prisma

COPY backend/start.sh ./start.sh
RUN chmod +x ./start.sh

EXPOSE 3001
CMD ["./start.sh"]