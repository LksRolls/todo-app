FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

# Copie des fichiers de configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN pnpm install --frozen-lockfile

# Build du backend
COPY backend/ ./backend/
RUN pnpm --filter backend exec prisma generate
RUN pnpm --filter backend build

# On nettoie les dépendances pour ne garder que la prod
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# ─── Runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Récupération des fichiers nécessaires
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./backend/package.json
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/backend/start.sh ./backend/start.sh

WORKDIR /app/backend
RUN chmod +x ./start.sh

EXPOSE 3001
CMD ["./start.sh"]