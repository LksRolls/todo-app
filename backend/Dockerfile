# ─── Builder ──────────────────────────────────────────────
FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN pnpm install --frozen-lockfile

COPY backend/ ./backend/

# On génère Prisma (généralement envoyé dans node_modules/.prisma)
RUN pnpm --filter backend exec prisma generate
RUN pnpm --filter backend build

# ─── Runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN npm install -g pnpm
WORKDIR /app

ENV NODE_ENV=production

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/

# On installe les deps de prod ET on régénère prisma ici
RUN pnpm install --frozen-lockfile --prod

# Copie des fichiers buildés
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma

# Script de démarrage
COPY backend/start.sh ./backend/start.sh
RUN chmod +x ./backend/start.sh

# On demande à Prisma de se régénérer une dernière fois pour être sûr
# que le client est présent dans les node_modules du runner
RUN pnpm --filter backend exec prisma generate

WORKDIR /app/backend
EXPOSE 3001
CMD ["./start.sh"]