# ── Stage 1: Base ──────────────────────────────────────────────────
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app

# ── Stage 2: Dependencies ─────────────────────────────────────────
FROM base AS deps

# Copy workspace configuration
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./

# Copy package.json from each workspace package
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# ── Stage 3: Builder ──────────────────────────────────────────────
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

# Copy source code
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY packages/shared/ packages/shared/
COPY apps/web/ apps/web/

# Generate Prisma client
WORKDIR /app/apps/web
RUN npx prisma generate

# Build Next.js (standalone output)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ── Stage 4: Runner ───────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build output
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# Copy prisma schema + migrations for runtime migrate
COPY --from=builder /app/apps/web/prisma ./apps/web/prisma
COPY --from=builder /app/apps/web/prisma.config.ts ./apps/web/prisma.config.ts
COPY --from=builder /app/apps/web/node_modules/.prisma ./apps/web/node_modules/.prisma
COPY --from=builder /app/apps/web/node_modules/@prisma ./apps/web/node_modules/@prisma

# Copy entrypoint script
COPY scripts/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Install prisma CLI for migrations at runtime (minimal)
RUN npm install -g prisma@7

USER nextjs

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
