import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { withRequestLog } from '@/lib/request-logger';
import { checkConsent, recordConsent } from '@/lib/services/consent.service';
import { logAudit } from '@/lib/services/audit-log.service';
import { resolvePrimaryTenantId } from '@/lib/services/voice-session.service';
import { VOICE_AUDIT_ACTIONS } from '@teki/shared';

export const runtime = 'nodejs';

const VOICE_POLICY_VERSION = '1.0';

// GET /api/v1/voice/consent — current AUDIO_RECORDING consent state
async function _GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const consent = await checkConsent(user.id, 'audio_recording');
    return NextResponse.json({
      granted: consent?.granted ?? false,
      recordedAt: consent?.recordedAt?.toISOString() ?? null,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: error.message } },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Erro desconhecido' } },
      { status: 500 }
    );
  }
}

// POST /api/v1/voice/consent — record consent decision (immutable trail)
async function _POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const body = await req.json().catch(() => ({}));
    const granted = Boolean(body?.granted);

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const userAgent = req.headers.get('user-agent') ?? undefined;

    await recordConsent({
      userId: user.id,
      purpose: 'audio_recording',
      granted,
      legalBasis: 'consent',
      policyVersion: VOICE_POLICY_VERSION,
      collectionMethod: 'prompt',
      ipAddress,
      userAgent,
    });

    const tenantId = await resolvePrimaryTenantId(user.id);
    await logAudit({
      action: granted
        ? VOICE_AUDIT_ACTIONS.CONSENT_GRANTED
        : VOICE_AUDIT_ACTIONS.CONSENT_REVOKED,
      tenantId,
      userId: user.id,
      details: { policyVersion: VOICE_POLICY_VERSION },
      ipAddress,
    });

    return NextResponse.json({ granted });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: error.message } },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Erro desconhecido' } },
      { status: 500 }
    );
  }
}

export const GET = withRequestLog(_GET);
export const POST = withRequestLog(_POST);
