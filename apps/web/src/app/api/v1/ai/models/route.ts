import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { ALL_MODELS, ALL_PROVIDERS } from '@teki/shared';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    const validKeys = await prisma.providerKey.findMany({
      where: { userId: user.id, status: 'valid' },
      select: { provider: true },
    });

    const validProviders = new Set(validKeys.map((k) => k.provider));

    // Also include providers that use env keys (gemini, openai, anthropic)
    if (process.env.GEMINI_API_KEY) validProviders.add('gemini');
    if (process.env.OPENAI_API_KEY) validProviders.add('openai');
    if (process.env.ANTHROPIC_API_KEY) validProviders.add('anthropic');

    const models = ALL_MODELS.filter((m) => validProviders.has(m.providerId)).map((m) => ({
      id: m.id,
      providerId: m.providerId,
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
      supportsVision: m.capabilities.vision,
      supportsStreaming: m.capabilities.streaming,
    }));

    return NextResponse.json({ models });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
