import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes
  const publicRoutes = ['/', '/entrar', '/verificar', '/docs'];
  const isPublic = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith('/docs/'),
  );

  // Auth-related routes
  const isAuthRoute = pathname.startsWith('/api/auth/');
  const isAuthPage = pathname.startsWith('/auth/');

  // Webhook routes — auth via signature verification
  const isWebhook = pathname.startsWith('/api/webhooks/');

  // V1 API routes — auth via Bearer token (handled per-route)
  const isApi = pathname.startsWith('/api/v1/');

  // Dev API routes (development only)
  const isDev = pathname.startsWith('/api/dev/');

  // Legacy API routes
  const isLegacyApi =
    pathname.startsWith('/api/solucoes') ||
    pathname.startsWith('/api/uploads') ||
    pathname.startsWith('/api/chat') ||
    pathname.startsWith('/api/channels') ||
    pathname.startsWith('/api/kb');

  if (isPublic || isWebhook || isApi || isAuthRoute || isAuthPage || isDev || isLegacyApi) {
    return NextResponse.next();
  }

  // Check for NextAuth session cookie (authjs.session-token or __Secure-authjs.session-token)
  const hasSession =
    req.cookies.has('authjs.session-token') ||
    req.cookies.has('__Secure-authjs.session-token') ||
    req.cookies.has('next-auth.session-token') ||
    req.cookies.has('__Secure-next-auth.session-token');

  if (!hasSession) {
    const loginUrl = new URL('/entrar', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
