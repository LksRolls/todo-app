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

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/

# On réinstalle les dépendances de prod à la racine pour les symlinks
RUN pnpm install --frozen-lockfile --prod

# On récupère le code compilé
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
# IMPORTANT : On récupère aussi les types générés de Prisma
COPY --from=builder /app/backend/node_modules/.prisma ./backend/node_modules/.prisma

# Script de démarrage
COPY backend/start.sh ./backend/start.sh
RUN chmod +x ./backend/start.sh

# On se place dans le dossier du backend pour l'exécution
WORKDIR /app/backend
EXPOSE 3001

CMD ["./start.sh"]