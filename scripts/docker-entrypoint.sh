#!/bin/sh
set -e

echo "[teki] Running database migrations..."
cd /app/apps/web
npx prisma migrate deploy 2>&1 || echo "[teki] Warning: migrations failed (DB may not be ready yet)"

echo "[teki] Starting Next.js server..."
cd /app
node apps/web/server.js
