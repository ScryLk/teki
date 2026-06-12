import { prisma } from '../prisma';
import { checkConsent } from './consent.service';
import { logAudit } from './audit-log.service';
import { clearSessionState } from './voice-trigger.service';
import {
  checkVoiceAccess,
  getCurrentVoicePeriod,
  getVoicePlanLimits,
} from '../voice-limits';
import {
  DEFAULT_VOICE_TRIGGER_CONFIG,
  DEFAULT_STT_POLICY,
  DEFAULT_TRANSCRIPT_RETENTION_HOURS,
  VOICE_AUDIT_ACTIONS,
  type SttPolicy,
  type VoiceSessionConfig,
  type VoiceSessionInfo,
} from '@teki/shared';
import type { PlanTier } from '@prisma/client';

// ═══════════════════════════════════════════════════════════════
// VoiceSessionService — lifecycle of voice listening sessions.
// A session is the unit of consent enforcement, plan quota
// accounting and audit (voice.activated / voice.deactivated).
// No raw audio ever reaches this layer.
// ═══════════════════════════════════════════════════════════════

export interface EffectiveVoiceConfig extends VoiceSessionConfig {
  prefilterMinSimilarity: number;
  dedupSimilarityThreshold: number;
  sttLatencyBudgetMs: number;
  minUtteranceMs: number;
  persistTranscripts: boolean;
  transcriptRetentionHours: number;
}

export async function resolvePrimaryTenantId(
  userId: string
): Promise<string | null> {
  const membership = await prisma.tenantMember.findFirst({
    where: { userId, status: 'ACTIVE' },
    orderBy: { createdAt: 'asc' },
    select: { tenantId: true },
  });
  return membership?.tenantId ?? null;
}

export async function getEffectiveVoiceConfig(
  tenantId: string | null,
  planId: PlanTier,
  remainingMinutes: number | null
): Promise<EffectiveVoiceConfig> {
  const tenantConfig = tenantId
    ? await prisma.tenantVoiceConfig.findUnique({ where: { tenantId } })
    : null;

  const planLimits = getVoicePlanLimits(planId);
  const sttPolicy: SttPolicy =
    tenantConfig?.sttPolicy === 'HYBRID' ? 'hybrid' : DEFAULT_STT_POLICY;

  return {
    triggerThreshold:
      tenantConfig?.triggerThreshold ??
      DEFAULT_VOICE_TRIGGER_CONFIG.triggerThreshold,
    contextWindowSec:
      tenantConfig?.contextWindowSec ??
      DEFAULT_VOICE_TRIGGER_CONFIG.contextWindowSec,
    cooldownSec:
      tenantConfig?.cooldownSec ?? DEFAULT_VOICE_TRIGGER_CONFIG.cooldownSec,
    sttPolicy: planLimits.allowedSttPolicies.includes(sttPolicy)
      ? sttPolicy
      : DEFAULT_STT_POLICY,
    cloudOptIn: tenantConfig?.cloudOptIn ?? false,
    remainingMinutes,
    prefilterMinSimilarity: DEFAULT_VOICE_TRIGGER_CONFIG.prefilterMinSimilarity,
    dedupSimilarityThreshold:
      DEFAULT_VOICE_TRIGGER_CONFIG.dedupSimilarityThreshold,
    sttLatencyBudgetMs: DEFAULT_VOICE_TRIGGER_CONFIG.sttLatencyBudgetMs,
    minUtteranceMs: DEFAULT_VOICE_TRIGGER_CONFIG.minUtteranceMs,
    persistTranscripts: tenantConfig?.persistTranscripts ?? false,
    transcriptRetentionHours:
      tenantConfig?.transcriptRetentionHours ??
      DEFAULT_TRANSCRIPT_RETENTION_HOURS,
  };
}

export type StartVoiceSessionError =
  | { code: 'PLAN_NOT_ALLOWED'; message: string; upgradeRequired?: PlanTier }
  | { code: 'QUOTA_EXCEEDED'; message: string; upgradeRequired?: PlanTier }
  | { code: 'CONSENT_REQUIRED'; message: string }
  | { code: 'FEATURE_DISABLED'; message: string }
  | { code: 'NO_AGENT'; message: string };

export async function startVoiceSession(params: {
  userId: string;
  planId: PlanTier;
  agentId?: string;
  ipAddress?: string;
}): Promise<
  | { session: VoiceSessionInfo; agentId: string; tenantId: string | null }
  | { error: StartVoiceSessionError }
> {
  const tenantId = await resolvePrimaryTenantId(params.userId);

  // 1. Plan gate (Free/Starter blocked; Pro quota; Enterprise unlimited)
  const access = await checkVoiceAccess(params.userId, params.planId);
  if (!access.allowed) {
    const blockedByPlan = access.limitMinutes === 0;
    return {
      error: {
        code: blockedByPlan ? 'PLAN_NOT_ALLOWED' : 'QUOTA_EXCEEDED',
        message: access.reason ?? 'Assistência por voz indisponível.',
        upgradeRequired: access.upgradeRequired,
      },
    };
  }

  // 2. Tenant-level feature toggle
  if (tenantId) {
    const tenantConfig = await prisma.tenantVoiceConfig.findUnique({
      where: { tenantId },
      select: { enabled: true },
    });
    if (tenantConfig && !tenantConfig.enabled) {
      return {
        error: {
          code: 'FEATURE_DISABLED',
          message: 'Assistência por voz desativada pelo administrador.',
        },
      };
    }
  }

  // 3. Explicit LGPD consent (AUDIO_RECORDING) — capture never starts without it
  const consent = await checkConsent(params.userId, 'audio_recording');
  if (!consent?.granted) {
    return {
      error: {
        code: 'CONSENT_REQUIRED',
        message:
          'Consentimento de captura de áudio é obrigatório para ativar a escuta.',
      },
    };
  }

  // 4. Agent for KB retrieval (same lookup pattern as the chat route)
  let agent = params.agentId
    ? await prisma.agent.findFirst({
        where: { id: params.agentId, userId: params.userId },
      })
    : null;
  if (!agent) {
    agent = await prisma.agent.findFirst({
      where: { userId: params.userId, isDefault: true },
    });
  }
  if (!agent) {
    agent = await prisma.agent.findFirst({ where: { userId: params.userId } });
  }
  if (!agent) {
    return {
      error: {
        code: 'NO_AGENT',
        message: 'Nenhum agente configurado para busca na base de conhecimento.',
      },
    };
  }

  const created = await prisma.voiceSession.create({
    data: {
      tenantId,
      userId: params.userId,
      agentId: agent.id,
      period: getCurrentVoicePeriod(),
    },
  });

  await logAudit({
    action: VOICE_AUDIT_ACTIONS.ACTIVATED,
    tenantId,
    userId: params.userId,
    resource: `voice_session:${created.id}`,
    details: { agentId: agent.id, plan: params.planId },
    ipAddress: params.ipAddress,
  });

  const config = await getEffectiveVoiceConfig(
    tenantId,
    params.planId,
    access.remainingMinutes
  );

  return {
    tenantId,
    agentId: agent.id,
    session: {
      id: created.id,
      status: 'active',
      startedAt: created.startedAt.toISOString(),
      config,
    },
  };
}

export async function endVoiceSession(params: {
  sessionId: string;
  userId: string;
  ipAddress?: string;
}): Promise<{ durationSeconds: number } | null> {
  const session = await prisma.voiceSession.findFirst({
    where: { id: params.sessionId, userId: params.userId },
  });
  if (!session) return null;

  const endedAt = new Date();
  const durationSeconds =
    session.status === 'ENDED'
      ? session.durationSeconds
      : Math.max(
          session.durationSeconds,
          Math.floor((endedAt.getTime() - session.startedAt.getTime()) / 1000)
        );

  if (session.status !== 'ENDED') {
    await prisma.voiceSession.update({
      where: { id: session.id },
      data: { status: 'ENDED', endedAt, durationSeconds },
    });

    await logAudit({
      action: VOICE_AUDIT_ACTIONS.DEACTIVATED,
      tenantId: session.tenantId,
      userId: params.userId,
      resource: `voice_session:${session.id}`,
      details: {
        durationSeconds,
        utteranceCount: session.utteranceCount,
        suggestionsSurfaced: session.suggestionsSurfaced,
        cloudFallbackCount: session.cloudFallbackCount,
      },
      ipAddress: params.ipAddress,
    });
  }

  clearSessionState(session.id);
  return { durationSeconds };
}
