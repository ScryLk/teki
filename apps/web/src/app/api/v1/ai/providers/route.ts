import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { ALL_PROVIDERS, getModelsByProvider } from '@teki/shared';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    const userKeys = await prisma.providerKey.findMany({
      where: { userId: user.id },
      select: {
        provider: true,
        keyMasked: true,
        status: true,
        isValid: true,
        lastValidatedAt: true,
        lastUsedAt: true,
        totalRequests: true,
        totalTokensUsed: true,
        monthlyBudgetUsd: true,
        customBaseUrl: true,
      },
    });

    const keyMap = new Map(userKeys.map((k) => [k.provider, k]));

    const providers = ALL_PROVIDERS.map((p) => {
      const key = keyMap.get(p.id);
      const models = getModelsByProvider(p.id);
      return {
        ...p,
        status: key?.status ?? 'unconfigured',
        isValid: key?.isValid ?? null,
        keyMasked: key?.keyMasked ?? null,
        lastValidatedAt: key?.lastValidatedAt ?? null,
        lastUsedAt: key?.lastUsedAt ?? null,
        totalRequests: key?.totalRequests ?? 0,
        totalTokensUsed: key?.totalTokensUsed ? Number(key.totalTokensUsed) : 0,
        monthlyBudgetUsd: key?.monthlyBudgetUsd ?? null,
        customBaseUrl: key?.customBaseUrl ?? null,
        models: models.map((m) => ({
          id: m.id,
          name: m.name,
          description: m.description,
          category: m.category,
          speedTier: m.speedTier,
          qualityTier: m.qualityTier,
          inputPricePerMtok: m.inputPricePerMtok,
          outputPricePerMtok: m.outputPricePerMtok,
          recommended: m.recommended,
          contextWindow: m.capabilities.maxContextTokens,
          maxOutputTokens: m.capabilities.maxOutputTokens,
        })),
      };
    });

    return NextResponse.json({ providers });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
