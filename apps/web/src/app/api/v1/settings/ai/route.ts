import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { DEFAULT_EXPANSION_CONFIG } from '@/lib/kb/query-expansion';
import { DEFAULT_CONFIDENCE_CONFIG } from '@/lib/kb/confidence-scorer';

export const runtime = 'nodejs';

/** Default settings merged when loading */
const DEFAULT_AI_SETTINGS = {
  query_expansion: {
    enabled: DEFAULT_EXPANSION_CONFIG.enabled,
    primaryThreshold: DEFAULT_EXPANSION_CONFIG.primaryThreshold,
    fallbackThreshold: DEFAULT_EXPANSION_CONFIG.fallbackThreshold,
    lastResortThreshold: DEFAULT_EXPANSION_CONFIG.lastResortThreshold,
    maxLayers: DEFAULT_EXPANSION_CONFIG.maxLayers,
    maxVariationsPerLayer: DEFAULT_EXPANSION_CONFIG.maxVariationsPerLayer,
    maxTotalTokens: DEFAULT_EXPANSION_CONFIG.maxTotalTokens,
    maxTotalLatencyMs: DEFAULT_EXPANSION_CONFIG.maxTotalLatencyMs,
    expansionModelId: DEFAULT_EXPANSION_CONFIG.expansionModelId,
    primaryLanguage: DEFAULT_EXPANSION_CONFIG.primaryLanguage,
    fallbackLanguageConfigs: DEFAULT_EXPANSION_CONFIG.fallbackLanguageConfigs,
    logExpansions: DEFAULT_EXPANSION_CONFIG.logExpansions,
  },
  confidence: {
    weights: DEFAULT_CONFIDENCE_CONFIG.weights,
    thresholds: DEFAULT_CONFIDENCE_CONFIG.thresholds,
    preset: DEFAULT_CONFIDENCE_CONFIG.preset,
  },
};

/**
 * GET /api/v1/settings/ai
 * Load tenant AI settings (query expansion + confidence), merged with defaults.
 */
export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    // Find the user's tenant via membership
    const membership = await prisma.tenantMember.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
      select: { tenantId: true },
    });

    if (!membership) {
      return NextResponse.json(DEFAULT_AI_SETTINGS);
    }

    // Load AiRoutingRules for this tenant
    const rules = await prisma.aiRoutingRules.findUnique({
      where: { tenantId: membership.tenantId },
      select: { typeRules: true },
    });

    const typeRules = (rules?.typeRules as Record<string, unknown>) ?? {};
    const savedExpansion = (typeRules.query_expansion ?? {}) as Record<string, unknown>;
    const savedConfidence = (typeRules.confidence ?? {}) as Record<string, unknown>;

    // Deep merge with defaults
    return NextResponse.json({
      query_expansion: { ...DEFAULT_AI_SETTINGS.query_expansion, ...savedExpansion },
      confidence: {
        ...DEFAULT_AI_SETTINGS.confidence,
        ...savedConfidence,
        weights: {
          ...DEFAULT_AI_SETTINGS.confidence.weights,
          ...((savedConfidence.weights ?? {}) as Record<string, unknown>),
        },
        thresholds: {
          ...DEFAULT_AI_SETTINGS.confidence.thresholds,
          ...((savedConfidence.thresholds ?? {}) as Record<string, unknown>),
        },
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[settings/ai GET]', message);
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}

/**
 * PATCH /api/v1/settings/ai
 * Save partial AI settings for the tenant.
 */
export async function PATCH(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    const body = await req.json();
    const { query_expansion, confidence } = body;

    // Find the user's tenant
    const membership = await prisma.tenantMember.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
      select: { tenantId: true },
    });

    if (!membership) {
      return NextResponse.json(
        { error: { code: 'NO_TENANT', message: 'Nenhum tenant ativo encontrado.' } },
        { status: 400 }
      );
    }

    // Load existing rules
    const existing = await prisma.aiRoutingRules.findUnique({
      where: { tenantId: membership.tenantId },
      select: { typeRules: true },
    });

    const currentTypeRules = (existing?.typeRules as Record<string, unknown>) ?? {};

    // Merge new settings
    const updatedTypeRules = { ...currentTypeRules };
    if (query_expansion) {
      updatedTypeRules.query_expansion = {
        ...((currentTypeRules.query_expansion ?? {}) as Record<string, unknown>),
        ...query_expansion,
      };
    }
    if (confidence) {
      const currentConfidence = (currentTypeRules.confidence ?? {}) as Record<string, unknown>;
      updatedTypeRules.confidence = {
        ...currentConfidence,
        ...confidence,
        ...(confidence.weights ? {
          weights: {
            ...((currentConfidence.weights ?? {}) as Record<string, unknown>),
            ...confidence.weights,
          },
        } : {}),
        ...(confidence.thresholds ? {
          thresholds: {
            ...((currentConfidence.thresholds ?? {}) as Record<string, unknown>),
            ...confidence.thresholds,
          },
        } : {}),
      };
    }

    // Upsert AiRoutingRules
    await prisma.aiRoutingRules.upsert({
      where: { tenantId: membership.tenantId },
      update: { typeRules: updatedTypeRules as Record<string, unknown> as import('@prisma/client').Prisma.InputJsonValue },
      create: {
        tenantId: membership.tenantId,
        typeRules: updatedTypeRules as Record<string, unknown> as import('@prisma/client').Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[settings/ai PATCH]', message);
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
