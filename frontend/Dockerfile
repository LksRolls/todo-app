# ─── Builder ──────────────────────────────────────────────
FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

# Fichiers de configuration du workspace
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Installation
RUN pnpm install --frozen-lockfile

# Copie du code source frontend
COPY frontend/ ./frontend/

# Injection des variables d'environnement pour le build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build du frontend
RUN pnpm --filter frontend build

# ─── Runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Ici, l'exemple suppose un serveur Node standard ou Next.js standalone
# Si tu utilises Next.js, adapte selon ta config (export ou standalone)
RUN npm install -g pnpm
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY frontend/package.json ./frontend/

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/frontend/.next ./frontend/.next
COPY --from=builder /app/frontend/public ./frontend/public
# Si tu as d'autres fichiers statiques ou config...

WORKDIR /app/frontend
EXPOSE 3000
CMD ["pnpm", "start"]