# ─── Builder ──────────────────────────────────────────────
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

# ─── Runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN npm install -g pnpm
WORKDIR /app

ENV NODE_ENV=production

# Fichiers racine pour le workspace
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/

# Installation des deps de prod
RUN pnpm install --frozen-lockfile --prod

# 1. On copie d'abord le code buildé ET le dossier prisma (pour le schéma)
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma

# 2. On génère le client Prisma maintenant que le schéma est là
# On utilise npx ici car il est plus direct pour trouver le binaire dans le path
RUN npx prisma generate --schema=./backend/prisma/schema.prisma

# 3. Script de démarrage
COPY backend/start.sh ./backend/start.sh
RUN chmod +x ./backend/start.sh

WORKDIR /app/backend
EXPOSE 3001

CMD ["./start.sh"]