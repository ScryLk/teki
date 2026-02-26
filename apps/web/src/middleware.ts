import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;

  // Public routes
  const publicRoutes = ['/', '/entrar', '/verificar', '/docs'];
  const isPublic = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith('/docs/'),
  );

  // Webhook routes — auth via signature verification
  const isWebhook = pathname.startsWith('/api/webhooks/');

  // V1 API routes — auth via Bearer token (handled per-route)
  const isApi = pathname.startsWith('/api/v1/');

  // NextAuth routes
  const isAuthRoute = pathname.startsWith('/api/auth/');

  // Dev API routes (development only)
  const isDev = pathname.startsWith('/api/dev/');

  // Legacy API routes
  const isLegacyApi =
    pathname.startsWith('/api/solucoes') ||
    pathname.startsWith('/api/uploads') ||
    pathname.startsWith('/api/chat') ||
    pathname.startsWith('/api/channels') ||
    pathname.startsWith('/api/kb');

  if (isPublic || isWebhook || isApi || isAuthRoute || isDev || isLegacyApi) {
    return NextResponse.next();
  }

  // Protected routes — redirect to /entrar if not logged in
  if (!isLoggedIn) {
    const loginUrl = new URL('/entrar', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
