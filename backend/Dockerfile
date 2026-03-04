# ─── Builder ──────────────────────────────────────────────
FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

# On copie d'abord les fichiers de config pour mettre en cache les dépendances
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN pnpm install --frozen-lockfile

# Maintenant on copie le code source du backend
COPY backend/ ./backend/

# Génération Prisma et Build NestJS
RUN pnpm --filter backend exec prisma generate
RUN pnpm --filter backend build

# ─── Runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# On installe PNPM dans le runner pour la gestion si besoin
RUN npm install -g pnpm

# On récupère les node_modules et fichiers racine
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# On récupère le build du backend
COPY --from=builder /app/backend/package.json ./backend/package.json
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/backend/start.sh ./backend/start.sh

WORKDIR /app/backend
RUN chmod +x ./start.sh

EXPOSE 3001
CMD ["./start.sh"]