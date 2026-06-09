FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

FROM base AS builder
# Manifests first (better layer cache)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/tournament-logic/package.json ./packages/tournament-logic/
RUN pnpm install --frozen-lockfile --filter api...

COPY . .
RUN pnpm --filter @wc2026/shared-types build \
 && pnpm --filter @wc2026/tournament-logic build \
 && pnpm --filter api build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

EXPOSE 10000
CMD ["node", "dist/main.js"]
