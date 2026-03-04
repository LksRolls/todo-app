# ─── Builder ──────────────────────────────────────────────
FROM node:20-alpine AS builder

# Force l'installation de Prisma 5 et pnpm
RUN npm install -g pnpm@9.15.4 prisma@5.22.0

WORKDIR /app

# Copie des fichiers de configuration pour le cache
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Installation des dépendances (sans --frozen-lockfile pour éviter les blocages)
RUN pnpm install

# Copie du code backend
COPY backend/ ./backend/

# Génération Prisma explicite avec npx (pour garantir la v5)
RUN npx prisma generate --schema=./backend/prisma/schema.prisma

# Build de l'application NestJS
RUN pnpm --filter backend build

# ─── Runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Copie de tout l'environnement nécessaire
COPY --from=builder /app ./

# On se place dans le dossier backend pour l'exécution
WORKDIR /app/backend

# S'assurer que le script de démarrage est exécutable
RUN chmod +x ./start.sh

EXPOSE 3001
CMD ["./start.sh"]