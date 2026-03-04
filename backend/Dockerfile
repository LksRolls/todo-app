# ─── Builder ──────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Installation de pnpm
RUN npm install -g pnpm@9.15.4

# Copie des fichiers de configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Installation de toutes les dépendances (dont Prisma 5)
RUN pnpm install --no-frozen-lockfile

# Copie de tout le code source
COPY . .

# Génération du client Prisma
RUN npx prisma generate --schema=./backend/prisma/schema.prisma

# Build du backend
RUN pnpm --filter backend build

# ─── Runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# On copie tout pour préserver le monorepo
COPY --from=builder /app ./

WORKDIR /app/backend

# Rendre le script exécutable (au cas où)
RUN chmod +x ./start.sh

EXPOSE 3001
CMD ["./start.sh"]