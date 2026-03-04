# ─── Builder ──────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

# 1. Copier les fichiers de configuration du workspace
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# 2. Installation à la racine (indispensable pour le lien entre packages)
RUN pnpm install --frozen-lockfile

# 3. Copier le code source et générer Prisma
COPY backend/ ./backend/
RUN pnpm --filter backend exec prisma generate

# 4. Build du backend depuis la racine via le filtre
RUN pnpm --filter backend build

# ─── Runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN npm install -g pnpm

# Copie des fichiers nécessaires pour réinstaller uniquement la prod
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/

# Installation des dépendances de production à la racine
ENV NODE_ENV=production
RUN pnpm install --frozen-lockfile --prod

# Récupération des builds et de Prisma
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/backend/node_modules/.prisma ./backend/node_modules/.prisma

# Script de démarrage
COPY backend/start.sh ./backend/start.sh
RUN chmod +x ./backend/start.sh

# On reste à la RACINE pour l'exécution, ou on ajuste le chemin du script
EXPOSE 3001
CMD ["./backend/start.sh"]