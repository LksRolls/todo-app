#!/bin/sh
set -e

# On s'assure d'être dans le bon dossier
cd /app/backend

echo "--- 🐘 Running Prisma migrations ---"
# Utilise pnpm pour être cohérent avec ton installation
# On spécifie le schéma explicitement au cas où
pnpm prisma migrate deploy --schema=./prisma/schema.prisma

echo "--- 🚀 Starting NestJS Server ---"
# exec permet au processus Node de récupérer le PID 1 (gestion des signaux Unix)
exec node dist/main