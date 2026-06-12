import { prisma } from './prisma';
import { VOICE_PLAN_LIMITS } from '@teki/shared';
import type { PlanTier } from '@prisma/client';

// ─── Voice listening plan gating ─────────────────────────────────────────────
// Free/Starter: feature disabled. Pro: monthly minutes quota.
// Enterprise: unlimited (local STT by default).

export interface VoiceLimitCheck {
  allowed: boolean;
  /** Remaining minutes; null = unlimited. */
  remainingMinutes: number | null;
  usedMinutes: number;
  limitMinutes: number | null;
  upgradeRequired?: PlanTier;
  reason?: string;
}

export function getVoicePlanLimits(planId: PlanTier) {
  return VOICE_PLAN_LIMITS[planId];
}

export function getCurrentVoicePeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export async function checkVoiceAccess(
  userId: string,
  planId: PlanTier
): Promise<VoiceLimitCheck> {
  const limits = VOICE_PLAN_LIMITS[planId];

  if (!limits.enabled) {
    return {
      allowed: false,
      remainingMinutes: 0,
      usedMinutes: 0,
      limitMinutes: 0,
      upgradeRequired: 'PRO',
      reason:
        'Assistência por voz está disponível nos planos Pro e Enterprise.',
    };
  }

  if (limits.monthlyMinutes === null) {
    return {
      allowed: true,
      remainingMinutes: null,
      usedMinutes: 0,
      limitMinutes: null,
    };
  }

  const period = getCurrentVoicePeriod();
  const usage = await prisma.voiceSession.aggregate({
    where: { userId, period },
    _sum: { durationSeconds: true },
  });

  const usedMinutes = Math.floor((usage._sum.durationSeconds ?? 0) / 60);
  const remaining = Math.max(0, limits.monthlyMinutes - usedMinutes);

  return {
    allowed: remaining > 0,
    remainingMinutes: remaining,
    usedMinutes,
    limitMinutes: limits.monthlyMinutes,
    upgradeRequired: remaining > 0 ? undefined : 'ENTERPRISE',
    reason:
      remaining > 0
        ? undefined
        : `Cota de ${limits.monthlyMinutes} minutos/mês de escuta atingida.`,
  };
}
