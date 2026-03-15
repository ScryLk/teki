import crypto from 'crypto';
import { prisma } from './prisma';
import { getPlan } from './plans';
import type { PlanTier } from '@prisma/client';

const API_KEY_PREFIX_LIVE = 'tk_live_';
const API_KEY_PREFIX_TEST = 'tk_test_';

// Cost per token in USD (update as pricing changes)
const TOKEN_COST_USD: Record<string, { input: number; output: number }> = {
  'gemini-flash':   { input: 0.075 / 1_000_000, output: 0.30 / 1_000_000 },
  'gemini-pro':     { input: 1.25  / 1_000_000, output: 5.00 / 1_000_000 },
  'gpt-4o-mini':    { input: 0.15  / 1_000_000, output: 0.60 / 1_000_000 },
  'gpt-4o':         { input: 2.50  / 1_000_000, output: 10.0 / 1_000_000 },
  'claude-haiku':   { input: 0.25  / 1_000_000, output: 1.25 / 1_000_000 },
  'claude-sonnet':  { input: 3.00  / 1_000_000, output: 15.0 / 1_000_000 },
};

export function estimateCost(modelId: string, tokensIn: number, tokensOut: number): number {
  const rates = TOKEN_COST_USD[modelId] ?? TOKEN_COST_USD['gemini-flash'];
  return tokensIn * rates.input + tokensOut * rates.output;
}

export async function createApiKey(
  userId: string,
  name: string,
  type: 'LIVE' | 'TEST',
  planId?: PlanTier,
  expiresAt?: Date
): Promise<{ key: string; id: string }> {
  const prefix = type === 'LIVE' ? API_KEY_PREFIX_LIVE : API_KEY_PREFIX_TEST;
  const randomPart = crypto.randomBytes(24).toString('base64url');
  const key = `${prefix}${randomPart}`;
  const keyHash = hashKey(key);
  const keyPrefix = key.slice(0, 12);

  // Plan-based limit check
  if (planId) {
    const plan = getPlan(planId);
    const maxKeys = plan.features.apiKeys;
    if (maxKeys === 0) {
      throw new Error('Seu plano não permite criar API Keys. Faça upgrade para Starter ou superior.');
    }
    const count = await prisma.apiKey.count({
      where: { userId, isRevoked: false },
    });
    if (count >= maxKeys) {
      throw new Error(`Limite de ${maxKeys} chaves ativas atingido para o plano ${plan.name}.`);
    }
  } else {
    // Fallback: legacy hardcoded limit
    const count = await prisma.apiKey.count({
      where: { userId, isRevoked: false },
    });
    if (count >= 5) {
      throw new Error('Limite de 5 chaves ativas atingido.');
    }
  }

  // Validate expiry is in the future
  if (expiresAt && expiresAt <= new Date()) {
    throw new Error('Data de expiração deve ser no futuro.');
  }

  const record = await prisma.apiKey.create({
    data: { userId, keyHash, keyPrefix, name, type, expiresAt: expiresAt ?? null },
  });

  return { key, id: record.id };
}

export async function authenticateApiKey(key: string) {
  if (!key.startsWith('tk_live_') && !key.startsWith('tk_test_')) {
    return null;
  }

  const keyHash = hashKey(key);

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { user: true },
  });

  if (!apiKey || apiKey.isRevoked) return null;
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;

  // Update lastUsedAt (fire-and-forget)
  prisma.apiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {});

  return {
    user: apiKey.user,
    apiKey,
    isTest: apiKey.type === 'TEST',
  };
}

export async function logApiKeyUsage(params: {
  apiKeyId: string;
  userId: string;
  endpoint: string;
  method: string;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  latencyMs: number;
  modelId?: string;
  statusCode?: number;
}): Promise<void> {
  const period = new Date().toISOString().slice(0, 7);
  prisma.apiKeyUsageLog
    .create({
      data: {
        apiKeyId: params.apiKeyId,
        userId: params.userId,
        endpoint: params.endpoint,
        method: params.method,
        tokensIn: params.tokensIn,
        tokensOut: params.tokensOut,
        costUsd: params.costUsd,
        latencyMs: params.latencyMs,
        modelId: params.modelId ?? null,
        statusCode: params.statusCode ?? 200,
        period,
      },
    })
    .catch(() => {});
}

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}
