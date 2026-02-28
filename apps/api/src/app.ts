import Fastify from 'fastify';
import { emailPlugin } from './infra/email/plugin.js';
import { devRoutes } from './modules/dev/dev.routes.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  });

  // ────────────────────── Infrastructure Plugins ──────────────────────
  await app.register(emailPlugin);

  // ────────────────────── Module Routes ──────────────────────

  // Dev routes (email preview) — only in development
  if (process.env.NODE_ENV !== 'production') {
    await app.register(devRoutes);
  }

  // ────────────────────── Health Check ──────────────────────
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  return app;
}
