# ON CHANGE LE NOM DE L'ETAPE POUR CASSER LE CACHE
FROM node:20-alpine AS construction_neuve
RUN npm install -g pnpm@9.15.4

WORKDIR /app

# On ne copie que les fichiers nécessaires pour l'install d'abord
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Installation sans check de lockfile pour forcer le passage
RUN pnpm install --no-frozen-lockfile

# Copie du reste
COPY . .

# On force l'installation de Prisma 5 localement juste avant le generate
RUN cd backend && npm install prisma@5.22.0 @prisma/client@5.22.0
RUN npx prisma generate --schema=./backend/prisma/schema.prisma

RUN pnpm --filter backend build

FROM node:20-alpine AS runner_neuf
WORKDIR /app
COPY --from=construction_neuve /app ./

WORKDIR /app/backend
RUN chmod +x ./start.sh

EXPOSE 3001
CMD ["./start.sh"]