import { prisma } from './prisma';
import { getPlan, PLAN_ORDER } from './plans';
import type { PlanTier } from '@prisma/client';

export interface LimitCheck {
  allowed: boolean;
  current: number;
  limit: number;
  percentage: number;
  remaining: number;
  upgradeRequired?: PlanTier;
  reason?: string;
}

// ─── Legacy compat (used by existing /api/v1/billing/plan) ───

export function getPlanLimits(planId: PlanTier) {
  const plan = getPlan(planId);
  return {
    agents: plan.limits.agents,
    messagesPerMonth: plan.limits.messagesPerMonth,
    documentsPerAgent: plan.limits.documentsPerAgent,
    kbSizeMB: plan.limits.kbSizeMB,
    models: plan.features.models,
    allowModelPerAgent: plan.features.modelSelection,
    allowBYOK: plan.features.byok,
    conversationRetentionDays: plan.limits.conversationRetentionDays,
    openclaw: plan.features.openclaw,
    openclawChannels: plan.features.openclawChannels,
  };
}

// ─── Mensagens ───

export async function checkMessageLimit(
  userId: string,
  planId: PlanTier,
  isByok = false
): Promise<LimitCheck> {
  const plan = getPlan(planId);
  const period = getCurrentPeriod();

  const usage = await prisma.usageCounter.findUnique({
    where: { userId_period: { userId, period } },
  });

  const current = usage?.messages ?? 0;
  const limit = plan.limits.messagesPerMonth;
  const remaining = Math.max(0, limit - current);
  const percentage = limit > 0 ? Math.min(100, (current / limit) * 100) : 0;

  return {
    allowed: isByok || current < limit,
    current,
    limit,
    percentage,
    remaining,
    upgradeRequired:
      !isByok && current >= limit ? getNextPlan(planId) : undefined,
    reason:
      !isByok && current >= limit
        ? `Limite de ${limit} mensagens/mes atingido.`
        : undefined,
  };
}

// ─── Agentes ───

export async function checkAgentLimit(
  userId: string,
  planId: PlanTier
): Promise<LimitCheck> {
  const plan = getPlan(planId);
  const current = await prisma.agent.count({ where: { userId } });
  const limit = plan.limits.agents;

  return {
    allowed: current < limit,
    current,
    limit,
    percentage: limit > 0 ? Math.min(100, (current / limit) * 100) : 0,
    remaining: Math.max(0, limit - current),
    upgradeRequired: current >= limit ? getNextPlan(planId) : undefined,
    reason:
      current >= limit
        ? `Limite de ${limit} agente(s) atingido.`
        : undefined,
  };
}

// ─── Documentos por agente ───

export async function checkDocumentLimit(
  userId: string,
  agentId: string,
  planId: PlanTier
): Promise<LimitCheck> {
  const plan = getPlan(planId);
  const current = await prisma.document.count({ where: { agentId } });
  const limit = plan.limits.documentsPerAgent;

  return {
    allowed: current < limit,
    current,
    limit,
    percentage: limit > 0 ? Math.min(100, (current / limit) * 100) : 0,
    remaining: Math.max(0, limit - current),
    upgradeRequired: current >= limit ? getNextPlan(planId) : undefined,
  };
}

// ─── Armazenamento KB ───

export async function checkStorageLimit(
  userId: string,
  planId: PlanTier
): Promise<LimitCheck> {
  const plan = getPlan(planId);

  const result = await prisma.document.aggregate({
    where: { userId },
    _sum: { fileSize: true },
  });

  const currentBytes = result._sum.fileSize ?? 0;
  const currentMB = currentBytes / (1024 * 1024);
  const limitMB = plan.limits.kbSizeMB;

  return {
    allowed: currentMB < limitMB,
    current: Math.round(currentMB * 10) / 10,
    limit: limitMB,
    percentage: limitMB > 0 ? Math.min(100, (currentMB / limitMB) * 100) : 0,
    remaining: Math.round(Math.max(0, limitMB - currentMB) * 10) / 10,
    upgradeRequired: currentMB >= limitMB ? getNextPlan(planId) : undefined,
  };
}

// ─── Canais OpenClaw ───

export async function checkChannelLimit(
  userId: string,
  planId: PlanTier
): Promise<LimitCheck & { featureAvailable: boolean }> {
  const plan = getPlan(planId);

  if (!plan.features.openclaw) {
    return {
      allowed: false,
      current: 0,
      limit: 0,
      percentage: 0,
      remaining: 0,
      featureAvailable: false,
      upgradeRequired: 'PRO',
      reason: 'OpenClaw disponivel a partir do plano Pro.',
    };
  }

  const current = await prisma.channel.count({
    where: { userId, isActive: true },
  });
  const limit = plan.features.openclawChannels;

  return {
    allowed: current < limit,
    current,
    limit,
    percentage: limit > 0 ? Math.min(100, (current / limit) * 100) : 0,
    remaining: Math.max(0, limit - current),
    featureAvailable: true,
  };
}

// ─── Acesso a modelo ───

export function checkModelAccess(
  planId: PlanTier,
  modelId: string
): { allowed: boolean; upgradeRequired?: PlanTier } {
  const plan = getPlan(planId);

  if (plan.features.models.includes(modelId)) {
    return { allowed: true };
  }

  for (const tier of ['STARTER', 'PRO', 'ENTERPRISE'] as PlanTier[]) {
    const tierPlan = getPlan(tier);
    if (tierPlan.features.models.includes(modelId)) {
      return { allowed: false, upgradeRequired: tier };
    }
  }

  return { allowed: false };
}

// ─── Feature access ───

export function checkFeatureAccess(
  planId: PlanTier,
  feature: 'byok' | 'openclaw' | 'modelSelection' | 'prioritySupport'
): { allowed: boolean; upgradeRequired?: PlanTier } {
  const plan = getPlan(planId);

  if (plan.features[feature]) {
    return { allowed: true };
  }

  for (const tier of ['STARTER', 'PRO', 'ENTERPRISE'] as PlanTier[]) {
    if (getPlan(tier).features[feature]) {
      return { allowed: false, upgradeRequired: tier };
    }
  }

  return { allowed: false };
}

// ─── Incrementar uso ───

export async function incrementUsage(
  userId: string,
  tokensIn: number,
  tokensOut: number,
  isByok = false
) {
  const period = getCurrentPeriod();

  await prisma.usageCounter.upsert({
    where: { userId_period: { userId, period } },
    update: {
      messages: { increment: 1 },
      tokensIn: { increment: tokensIn },
      tokensOut: { increment: tokensOut },
      ...(isByok ? { byokMessages: { increment: 1 } } : {}),
    },
    create: {
      userId,
      period,
      messages: 1,
      tokensIn,
      tokensOut,
      byokMessages: isByok ? 1 : 0,
    },
  });
}

// ─── Uso completo (pra dashboard) ───

export async function getFullUsage(userId: string, planId: PlanTier) {
  const [messages, agents, storage] = await Promise.all([
    checkMessageLimit(userId, planId),
    checkAgentLimit(userId, planId),
    checkStorageLimit(userId, planId),
  ]);

  const period = getCurrentPeriod();
  const usage = await prisma.usageCounter.findUnique({
    where: { userId_period: { userId, period } },
  });

  return {
    messages,
    agents,
    storage,
    byokMessages: usage?.byokMessages ?? 0,
    period,
  };
}

// ─── Helpers ───

function getCurrentPeriod(): string {
  return new Date().toISOString().slice(0, 7);
}

function getNextPlan(currentPlan: PlanTier): PlanTier | undefined {
  const idx = PLAN_ORDER.indexOf(currentPlan);
  return idx < PLAN_ORDER.length - 1 ? PLAN_ORDER[idx + 1] : undefined;
}
