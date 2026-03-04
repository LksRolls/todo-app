#!/bin/sh
set -e

cd /app/backend

echo "--- Running Prisma migrations ---"
npx prisma migrate deploy

echo "--- Starting NestJS Server ---"
exec node dist/main.js