import type { PlanTier } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getKbLimits, formatBytes } from './plan-config';
import type { LimitCheckResult, KbUsageSummary, InsertionMode } from './types';

export async function checkKbAction(
  userId: string,
  planId: PlanTier,
  action: string,
  metadata?: Record<string, unknown>
): Promise<LimitCheckResult> {
  const limits = getKbLimits(planId);

  switch (action) {
    case 'kb:create_article': {
      const count = await prisma.kbArticle.count({ where: { userId } });
      if (count >= limits.maxKbArticles) {
        return {
          allowed: false,
          reason: `Limite de ${limits.maxKbArticles} artigos atingido`,
          currentUsage: count,
          limit: limits.maxKbArticles,
          upgradeRequired: nextPlanWith(planId, 'maxKbArticles'),
        };
      }
      return { allowed: true };
    }

    case 'kb:upload_file': {
      if (!limits.allowedInsertionModes.includes('file_upload')) {
        return {
          allowed: false,
          reason: 'Upload de arquivo não disponível no seu plano',
          upgradeRequired: 'PRO',
        };
      }
      const fileSize = (metadata?.fileSize as number) ?? 0;
      if (fileSize > limits.maxFileSizeBytes) {
        return {
          allowed: false,
          reason: `Arquivo excede o limite de ${formatBytes(limits.maxFileSizeBytes)}`,
          upgradeRequired: nextPlanWith(planId, 'maxFileSizeBytes'),
        };
      }
      // Check storage
      const storageResult = await prisma.kbArticleAttachment.aggregate({
        where: { userId },
        _sum: { fileSizeBytes: true },
      });
      const usedStorage = storageResult._sum.fileSizeBytes ?? 0;
      if (usedStorage + fileSize > limits.maxStorageBytes) {
        return {
          allowed: false,
          reason: 'Espaço de armazenamento insuficiente',
          currentUsage: usedStorage,
          limit: limits.maxStorageBytes,
          upgradeRequired: nextPlanWith(planId, 'maxStorageBytes'),
        };
      }
      return { allowed: true };
    }

    case 'kb:from_chat': {
      if (!limits.allowedInsertionModes.includes('from_chat')) {
        return {
          allowed: false,
          reason: 'Salvar do Chat não disponível no seu plano',
          upgradeRequired: 'STARTER',
        };
      }
      return { allowed: true };
    }

    case 'kb:insertion_mode': {
      const mode = metadata?.mode as InsertionMode;
      if (!limits.allowedInsertionModes.includes(mode)) {
        const tierMap: Record<string, string> = {
          file_upload: 'PRO',
          from_chat: 'STARTER',
        };
        return {
          allowed: false,
          reason: `Modo "${mode}" não disponível no seu plano`,
          upgradeRequired: tierMap[mode] ?? 'PRO',
        };
      }
      return { allowed: true };
    }

    case 'kb:ai_suggestion': {
      const today = new Date().toISOString().slice(0, 10);
      const count = await prisma.kbInsertionLog.count({
        where: {
          userId,
          aiProvider: { not: null },
          createdAt: { gte: new Date(today) },
        },
      });
      if (count >= limits.maxAiSuggestionsPerDay) {
        return {
          allowed: false,
          reason: `Limite de ${limits.maxAiSuggestionsPerDay} sugestões de IA por dia atingido`,
          currentUsage: count,
          limit: limits.maxAiSuggestionsPerDay,
          upgradeRequired: nextPlanWith(planId, 'maxAiSuggestionsPerDay'),
        };
      }
      return { allowed: true };
    }

    default:
      return { allowed: true };
  }
}

export async function getKbUsageSummary(
  userId: string,
  planId: PlanTier
): Promise<KbUsageSummary> {
  const limits = getKbLimits(planId);

  const [articleCount, storageResult, aiSuggestionsToday] = await Promise.all([
    prisma.kbArticle.count({ where: { userId } }),
    prisma.kbArticleAttachment.aggregate({
      where: { userId },
      _sum: { fileSizeBytes: true },
    }),
    prisma.kbInsertionLog.count({
      where: {
        userId,
        aiProvider: { not: null },
        createdAt: { gte: new Date(new Date().toISOString().slice(0, 10)) },
      },
    }),
  ]);

  const usedStorage = storageResult._sum.fileSizeBytes ?? 0;

  return {
    articles: {
      used: articleCount,
      limit: limits.maxKbArticles,
      percentage: Math.round((articleCount / limits.maxKbArticles) * 100),
    },
    storage: {
      usedBytes: usedStorage,
      limitBytes: limits.maxStorageBytes,
      percentage: Math.round((usedStorage / limits.maxStorageBytes) * 100),
      usedFormatted: formatBytes(usedStorage),
      limitFormatted: formatBytes(limits.maxStorageBytes),
    },
    aiSuggestions: {
      usedToday: aiSuggestionsToday,
      limitPerDay: limits.maxAiSuggestionsPerDay,
      percentage: Math.round((aiSuggestionsToday / limits.maxAiSuggestionsPerDay) * 100),
    },
  };
}

function nextPlanWith(currentPlan: PlanTier, limitKey: string): string {
  const tiers: PlanTier[] = ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'];
  const currentIdx = tiers.indexOf(currentPlan);
  const currentLimits = getKbLimits(currentPlan);
  const currentValue = (currentLimits as unknown as Record<string, unknown>)[limitKey];

  for (let i = currentIdx + 1; i < tiers.length; i++) {
    const nextLimits = getKbLimits(tiers[i]);
    const nextValue = (nextLimits as unknown as Record<string, unknown>)[limitKey];
    if (typeof currentValue === 'number' && typeof nextValue === 'number' && nextValue > currentValue) {
      return tiers[i];
    }
  }
  return 'ENTERPRISE';
}
