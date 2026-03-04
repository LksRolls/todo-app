FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY frontend/package.json ./package.json
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/ ./frontend/

WORKDIR /app/frontend

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN pnpm install --frozen-lockfile
RUN NEXT_STANDALONE=true pnpm build

# ─── Runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./.next/static
COPY --from=builder /app/frontend/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
