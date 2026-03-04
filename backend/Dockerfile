# ─── Builder ──────────────────────────────────────────────
FROM node:20-alpine AS builder

# 1. AJOUT VITAL : Installation de OpenSSL pour le moteur Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Installation de pnpm
RUN npm install -g pnpm@9.15.4

# Copie des fichiers de configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Installation des dépendances
RUN pnpm install --no-frozen-lockfile

# Copie de tout le code source
COPY . .

# 2. CORRECTION : On utilise pnpm --filter pour être dans le bon contexte
RUN pnpm --filter backend exec prisma generate

# Build du backend
RUN pnpm --filter backend build

# ─── Runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner

# Il faut aussi OpenSSL dans le runner pour exécuter Prisma en production !
RUN apk add --no-cache openssl

WORKDIR /app

# On copie tout pour préserver le monorepo
COPY --from=builder /app ./

WORKDIR /app/backend

# Rendre le script exécutable (au cas où)
RUN chmod +x ./start.sh

EXPOSE 3001
CMD ["./start.sh"]