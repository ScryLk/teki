import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteHandler = (req: NextRequest, ctx?: any) => Promise<NextResponse | Response>;

/**
 * Wraps a Next.js route handler to automatically log HTTP requests
 * to the HttpRequestLog table. Logging is fire-and-forget.
 */
export function withRequestLog<T extends RouteHandler>(handler: T): T {
  const wrapped = async (req: NextRequest, ctx?: unknown) => {
    const start = Date.now();
    let statusCode = 500;

    try {
      const res = await handler(req, ctx as never);
      statusCode = res.status;
      return res;
    } catch (err) {
      statusCode = 500;
      throw err;
    } finally {
      const latencyMs = Date.now() - start;
      const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        null;

      prisma.httpRequestLog
        .create({
          data: {
            method: req.method,
            path: req.nextUrl.pathname,
            statusCode,
            latencyMs,
            ip,
            userAgent: req.headers.get('user-agent'),
          },
        })
        .catch(() => {});
    }
  };
  return wrapped as T;
}
