import type { PlanTier } from '@prisma/client';
import { prisma } from './prisma';

interface PlanLimits {
  agents: number;
  messagesPerMonth: number;
  documentsPerAgent: number;
  kbSizeMB: number;
  models: string[];
  allowModelPerAgent: boolean;
  allowBYOK: boolean;
  conversationRetentionDays: number;
  openclaw: boolean;
  openclawChannels: number;
}

const LIMITS: Record<PlanTier, PlanLimits> = {
  FREE: {
    agents: 1,
    messagesPerMonth: 50,
    documentsPerAgent: 2,
    kbSizeMB: 5,
    models: ['gemini-flash'],
    allowModelPerAgent: false,
    allowBYOK: false,
    conversationRetentionDays: 7,
    openclaw: false,
    openclawChannels: 0,
  },
  STARTER: {
    agents: 1,
    messagesPerMonth: 500,
    documentsPerAgent: 5,
    kbSizeMB: 25,
    models: ['gemini-flash', 'gpt-4o-mini', 'claude-haiku'],
    allowModelPerAgent: true,
    allowBYOK: false,
    conversationRetentionDays: 30,
    openclaw: false,
    openclawChannels: 0,
  },
  PRO: {
    agents: 5,
    messagesPerMonth: 2000,
    documentsPerAgent: 50,
    kbSizeMB: 100,
    models: [
      'gemini-flash',
      'gemini-pro',
      'gpt-4o-mini',
      'gpt-4o',
      'claude-haiku',
      'claude-sonnet',
      'ollama-custom',
    ],
    allowModelPerAgent: true,
    allowBYOK: true,
    conversationRetentionDays: -1,
    openclaw: true,
    openclawChannels: 3,
  },
  ENTERPRISE: {
    agents: 999,
    messagesPerMonth: 999999,
    documentsPerAgent: 999,
    kbSizeMB: 10000,
    models: [
      'gemini-flash',
      'gemini-pro',
      'gpt-4o-mini',
      'gpt-4o',
      'claude-haiku',
      'claude-sonnet',
      'ollama-custom',
    ],
    allowModelPerAgent: true,
    allowBYOK: true,
    conversationRetentionDays: -1,
    openclaw: true,
    openclawChannels: 999,
  },
};

export function getPlanLimits(planId: PlanTier): PlanLimits {
  return LIMITS[planId];
}

export async function checkMessageLimit(
  userId: string,
  planId: PlanTier,
  isByok = false
) {
  const limits = getPlanLimits(planId);
  const period = getCurrentPeriod();

  const usage = await prisma.usageCounter.findUnique({
    where: { userId_period: { userId, period } },
  });

  const current = usage?.messages ?? 0;
  const remaining = Math.max(0, limits.messagesPerMonth - current);

  return {
    allowed: isByok || current < limits.messagesPerMonth,
    current,
    limit: limits.messagesPerMonth,
    remaining,
    isByok,
  };
}

export async function checkAgentLimit(userId: string, planId: PlanTier) {
  const limits = getPlanLimits(planId);
  const count = await prisma.agent.count({ where: { userId } });
  return { allowed: count < limits.agents, current: count, limit: limits.agents };
}

export async function checkDocumentLimit(
  userId: string,
  agentId: string,
  planId: PlanTier
) {
  const limits = getPlanLimits(planId);
  const count = await prisma.document.count({ where: { agentId } });
  return {
    allowed: count < limits.documentsPerAgent,
    current: count,
    limit: limits.documentsPerAgent,
  };
}

export async function checkChannelLimit(userId: string, planId: PlanTier) {
  const limits = getPlanLimits(planId);
  if (!limits.openclaw)
    return { allowed: false, current: 0, limit: 0, reason: 'OpenClaw requer plano Pro.' };
  const count = await prisma.channel.count({
    where: { userId, isActive: true },
  });
  return {
    allowed: count < limits.openclawChannels,
    current: count,
    limit: limits.openclawChannels,
  };
}

export async function checkModelAccess(planId: PlanTier, modelId: string) {
  const limits = getPlanLimits(planId);
  return { allowed: limits.models.includes(modelId), availableModels: limits.models };
}

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
      byokMessages: isByok ? { increment: 1 } : undefined,
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

function getCurrentPeriod(): string {
  return new Date().toISOString().slice(0, 7);
}
