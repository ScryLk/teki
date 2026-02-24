import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { revokeAllSessions } from '@/lib/services/session.service';

/**
 * POST /api/auth/logout
 * Revokes all sessions for the authenticated user.
 */
export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    await revokeAllSessions(user.id, user.id, 'USER_LOGOUT');
    return NextResponse.json({ message: 'Sessao encerrada.' });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: error.message } },
        { status: 401 }
      );
    }
    console.error('[auth/logout]', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
