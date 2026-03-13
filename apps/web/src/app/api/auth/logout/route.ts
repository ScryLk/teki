import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { revokeAllSessions } from '@/lib/services/session.service';
import { logDataAccess } from '@/lib/services/data-access-log.service';

/**
 * POST /api/auth/logout
 * Revokes all sessions for the authenticated user.
 */
export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    await revokeAllSessions(user.id, user.id, 'USER_LOGOUT');

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const userAgent = req.headers.get('user-agent') ?? undefined;

    logDataAccess({
      accessorId: user.id,
      accessorType: 'user',
      subjectId: user.id,
      action: 'modify',
      dataCategories: ['auth_tokens'],
      justification: 'Logout - sessoes revogadas',
      ipAddress,
      userAgent,
    }).catch(() => {});

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
