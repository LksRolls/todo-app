# ─── Builder ──────────────────────────────────────────────
FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

# On copie tout le nécessaire pour le workspace
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Installation depuis la racine
RUN pnpm install --frozen-lockfile

# Copy source et build (on reste dans /app pour utiliser les scripts de build)
COPY backend/ ./backend/
# Pas besoin de changer de WORKDIR, on peut cibler le package avec --filter
RUN pnpm --filter backend exec prisma generate
RUN pnpm --filter backend build

# ─── Runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN npm install -g pnpm
WORKDIR /app

# Copie uniquement les dépendances nécessaires à la prod
# Astuce : On ne réinstalle pas tout, on utilise --prod
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/

# Installation propre des dépendances de prod uniquement
RUN pnpm install --frozen-lockfile --prod

# Copie des artefacts du build depuis le builder
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
# On copie aussi les fichiers nécessaires au runtime
COPY backend/start.sh ./backend/start.sh
RUN chmod +x ./backend/start.sh

# Le runtime n'a besoin que du dossier backend
WORKDIR /app/backend
EXPOSE 3001
CMD ["./start.sh"]