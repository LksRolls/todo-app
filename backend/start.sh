#!/bin/sh
set -e

# Le WORKDIR dans le Dockerfile est déjà /app/backend, 
# mais on assure le coup
cd /app/backend

echo "--- Running Prisma migrations ---"
# Utilisation de npx (plus léger ici) ou pnpm
npx prisma migrate deploy

echo "--- Starting NestJS Server ---"
# Ajout de .js à la fin de main
exec node dist/main.js