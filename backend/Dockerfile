# ... (début du builder identique)

COPY backend/ ./backend/
RUN pnpm --filter backend exec prisma generate
RUN pnpm --filter backend build

# --- AU LIEU DU PNPM INSTALL --PROD QUI PLANTE ---
# On ne fait rien ici, on va gérer la séparation dans le Runner
# --------------------------------------------------

# ─── Runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# On installe PNPM dans le runner pour gérer les deps
RUN npm install -g pnpm

# On récupère TOUT le dossier node_modules (builder) car NestJS en a besoin 
# et c'est plus simple que de se battre avec les liens symboliques pnpm
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# On récupère le code compilé
COPY --from=builder /app/backend/package.json ./backend/package.json
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/backend/start.sh ./backend/start.sh

WORKDIR /app/backend
RUN chmod +x ./start.sh

EXPOSE 3001
CMD ["./start.sh"]