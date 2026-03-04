#!/bin/sh
# Générer le client Prisma au démarrage au cas où
npx prisma generate
# Appliquer les migrations
npx prisma migrate deploy
# Lancer l'app (vérifie si c'est dist/main ou dist/src/main)
node dist/main.js