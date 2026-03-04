# ─── Builder ──────────────────────────────────────────────
FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

# On copie les fichiers de configuration du workspace
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Installation complète (nécessaire pour builder)
RUN pnpm install --frozen-lockfile

# Copie du code source backend
COPY backend/ ./backend/

# Génération Prisma (indispensable AVANT le build NestJS)
RUN pnpm --filter backend exec prisma generate

# Build de l'application
RUN pnpm --filter backend build

# ─── Runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
# On installe pnpm aussi dans le runner pour le start.sh si besoin
RUN npm install -g pnpm
WORKDIR /app

ENV NODE_ENV=production

# On copie les fichiers de config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/

# Installation des dépendances de prod uniquement
RUN pnpm install --frozen-lockfile --prod

# 1. On récupère TOUT le dossier node_modules généré par le builder 
# C'est l'astuce : pnpm gère les liens vers .pnpm, donc on copie le dossier racine
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/node_modules ./backend/node_modules

# 2. On récupère les builds et prisma
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma

# 3. Script de démarrage
COPY backend/start.sh ./backend/start.sh
RUN chmod +x ./backend/start.sh

WORKDIR /app/backend
EXPOSE 3001

CMD ["./start.sh"]