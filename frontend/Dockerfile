FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN pnpm install --frozen-lockfile

COPY frontend/ ./frontend/

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN pnpm --filter frontend build
RUN pnpm --filter frontend deploy --prod /prod/frontend

# ─── Runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app/frontend

COPY --from=builder /prod/frontend ./
COPY --from=builder /app/frontend/.next ./.next

EXPOSE 3000
# Commande standard pour Next.js
CMD ["npx", "next", "start"]