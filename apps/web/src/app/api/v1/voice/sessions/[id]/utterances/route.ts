import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { withRequestLog } from '@/lib/request-logger';
import { prisma } from '@/lib/prisma';
import { transcribeUtterance } from '@/lib/stt';
import { processUtterance } from '@/lib/services/voice-trigger.service';
import { getEffectiveVoiceConfig } from '@/lib/services/voice-session.service';
import { logAuditSafe } from '@/lib/services/audit-log.service';
import { checkVoiceAccess } from '@/lib/voice-limits';
import {
  VOICE_AUDIT_ACTIONS,
  type VoiceUtteranceResult,
} from '@teki/shared';

export const runtime = 'nodejs';

// Hard cap on a single utterance payload (~60s of 16kHz mono 16-bit WAV).
const MAX_AUDIO_BYTES = 4 * 1024 * 1024;

// POST /api/v1/voice/sessions/[id]/utterances
// Receives ONE finished reporter utterance (channel B) as in-memory audio,
// transcribes it (hybrid STT) and runs the suggestion trigger pipeline.
// LGPD: the audio buffer lives only in this request scope — it is never
// written to disk, storage or logs.
async function _POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;

    const session = await prisma.voiceSession.findFirst({
      where: { id, userId: user.id },
    });
    if (!session) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Sessão não encontrada.' } },
        { status: 404 }
      );
    }
    if (session.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: { code: 'SESSION_ENDED', message: 'Sessão encerrada.' } },
        { status: 409 }
      );
    }

    const body = await req.json().catch(() => null);
    const audioBase64: unknown = body?.audioBase64;
    const durationMs = Number(body?.durationMs ?? 0);
    if (typeof audioBase64 !== 'string' || audioBase64.length === 0) {
      return NextResponse.json(
        { error: { code: 'INVALID_BODY', message: 'Áudio ausente.' } },
        { status: 400 }
      );
    }

    const audioBuffer = Buffer.from(audioBase64, 'base64');
    if (audioBuffer.byteLength > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { error: { code: 'PAYLOAD_TOO_LARGE', message: 'Trecho de áudio muito longo.' } },
        { status: 413 }
      );
    }

    // Keep wall-clock listening time up to date and re-check the Pro quota.
    const elapsedSeconds = Math.floor(
      (Date.now() - session.startedAt.getTime()) / 1000
    );
    await prisma.voiceSession.update({
      where: { id: session.id },
      data: {
        durationSeconds: Math.max(session.durationSeconds, elapsedSeconds),
        utteranceCount: { increment: 1 },
      },
    });

    const access = await checkVoiceAccess(user.id, user.planId);
    if (!access.allowed) {
      return NextResponse.json(
        {
          error: {
            code: 'QUOTA_EXCEEDED',
            message: access.reason ?? 'Cota de minutos atingida.',
          },
        },
        { status: 429 }
      );
    }

    const config = await getEffectiveVoiceConfig(
      session.tenantId,
      user.planId,
      access.remainingMinutes
    );

    // ── STT (hybrid, local-first; cloud only under tenant opt-in) ──
    const outcome = await transcribeUtterance(
      {
        buffer: audioBuffer,
        mimeType: typeof body?.mimeType === 'string' ? body.mimeType : 'audio/wav',
        durationMs,
      },
      { language: 'pt' },
      {
        sttPolicy: config.sttPolicy,
        cloudOptIn: config.cloudOptIn,
        latencyBudgetMs: config.sttLatencyBudgetMs,
      }
    );

    if (outcome.fallback) {
      logAuditSafe({
        action: VOICE_AUDIT_ACTIONS.STT_FALLBACK_CLOUD,
        tenantId: session.tenantId,
        userId: user.id,
        resource: `voice_session:${session.id}`,
        details: {
          reason: outcome.fallback.reason,
          providerId: outcome.result.providerId,
          latencyMs: outcome.result.latencyMs,
        },
      });
      prisma.voiceSession
        .update({
          where: { id: session.id },
          data: { cloudFallbackCount: { increment: 1 } },
        })
        .catch(() => {});
    }

    const text = outcome.result.text;

    // Optional transcript persistence (tenant opt-in, short retention)
    if (text && config.persistTranscripts) {
      const expiresAt = new Date(
        Date.now() + config.transcriptRetentionHours * 60 * 60 * 1000
      );
      prisma.voiceTranscriptSegment
        .create({
          data: {
            sessionId: session.id,
            text,
            origin: outcome.result.origin === 'cloud' ? 'CLOUD' : 'LOCAL',
            providerId: outcome.result.providerId,
            confidence: outcome.result.confidence,
            expiresAt,
          },
        })
        .catch(() => {});
    }

    // ── Trigger pipeline (only for utterances long enough to matter) ──
    let suggestion = null;
    if (text && durationMs >= config.minUtteranceMs && session.agentId) {
      suggestion = await processUtterance({
        sessionId: session.id,
        tenantId: session.tenantId,
        userId: user.id,
        agentId: session.agentId,
        text,
        sttOrigin: outcome.result.origin,
        config,
      });
    }

    const result: VoiceUtteranceResult = {
      transcription: text
        ? {
            text,
            origin: outcome.result.origin,
            providerId: outcome.result.providerId,
          }
        : null,
      suggestion,
    };

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: error.message } },
        { status: 401 }
      );
    }
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[voice utterances route]', message);
    return NextResponse.json(
      { error: { code: 'STT_ERROR', message } },
      { status: 502 }
    );
  }
}

export const POST = withRequestLog(_POST);
