# ─── Builder ──────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN npm install -g pnpm@9.15.4

WORKDIR /app

# Cache des dépendances
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN pnpm install

# Copie du code frontend
COPY frontend/ ./frontend/

# Variables d'environnement pour le build Next.js
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build de l'application Next.js
RUN pnpm --filter frontend build

# ─── Runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Copie de l'intégralité du workspace pour préserver les liens symboliques pnpm
COPY --from=builder /app ./

# On se déplace dans le frontend pour lancer Next.js
WORKDIR /app/frontend

EXPOSE 3000

# Utilisation de npx pour lancer next afin qu'il résolve correctement les dépendances
CMD ["npx", "next", "start"]