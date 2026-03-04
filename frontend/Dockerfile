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

FROM node:20-alpine AS runner
WORKDIR /app
RUN npm install -g pnpm

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/frontend ./frontend

WORKDIR /app/frontend
EXPOSE 3000
CMD ["npx", "next", "start"]