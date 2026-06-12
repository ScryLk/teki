import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { withRequestLog } from '@/lib/request-logger';
import { endVoiceSession } from '@/lib/services/voice-session.service';

export const runtime = 'nodejs';

// DELETE /api/v1/voice/sessions/[id] — end a voice listening session
async function _DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;

    const result = await endVoiceSession({
      sessionId: id,
      userId: user.id,
      ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
    });

    if (!result) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Sessão não encontrada.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'ended',
      durationSeconds: result.durationSeconds,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: error.message } },
        { status: 401 }
      );
    }
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[voice session end route]', message);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}

export const DELETE = withRequestLog(_DELETE);
