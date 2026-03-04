# ─── Builder ──────────────────────────────────────────────
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl

WORKDIR /app

RUN npm install -g pnpm@9.15.4

# Cache des dépendances
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN pnpm install --no-frozen-lockfile

# Copie du code
COPY . .

# On force la génération du client Prisma dans le dossier node_modules du backend
RUN cd backend && npx prisma generate

# Build avec les variables d'environnement (NestJS en a parfois besoin pour valider la config)
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
ARG JWT_SECRET
ENV JWT_SECRET=${JWT_SECRET}

# Lancement du build du backend
RUN pnpm --filter backend build

# ─── Runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=builder /app ./

WORKDIR /app/backend
RUN chmod +x ./start.sh

EXPOSE 3001
CMD ["./start.sh"]