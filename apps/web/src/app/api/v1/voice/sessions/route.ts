import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { withRequestLog } from '@/lib/request-logger';
import { startVoiceSession } from '@/lib/services/voice-session.service';

export const runtime = 'nodejs';

const ERROR_STATUS: Record<string, number> = {
  PLAN_NOT_ALLOWED: 403,
  QUOTA_EXCEEDED: 429,
  CONSENT_REQUIRED: 403,
  FEATURE_DISABLED: 403,
  NO_AGENT: 422,
};

// POST /api/v1/voice/sessions — start a voice listening session
async function _POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const body = await req.json().catch(() => ({}));

    const result = await startVoiceSession({
      userId: user.id,
      planId: user.planId,
      agentId: typeof body?.agentId === 'string' ? body.agentId : undefined,
      ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
    });

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: ERROR_STATUS[result.error.code] ?? 400 }
      );
    }

    return NextResponse.json(result.session, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: error.message } },
        { status: 401 }
      );
    }
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[voice sessions route]', message);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}

export const POST = withRequestLog(_POST);
