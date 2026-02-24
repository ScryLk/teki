import type { PlanTier } from '@prisma/client';
import type { KbPlanLimits, InsertionMode } from './types';

export const KB_PLAN_LIMITS: Record<PlanTier, KbPlanLimits> = {
  FREE: {
    maxKbArticles: 50,
    maxStorageBytes: 100 * 1024 * 1024, // 100MB
    maxFileSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedInsertionModes: ['quick_add', 'full_form'],
    allowedFileTypes: ['text/plain', 'text/markdown'],
    maxAiSuggestionsPerDay: 20,
  },
  STARTER: {
    maxKbArticles: 500,
    maxStorageBytes: 1024 * 1024 * 1024, // 1GB
    maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedInsertionModes: ['quick_add', 'full_form', 'from_chat'],
    allowedFileTypes: ['text/plain', 'text/markdown', 'application/pdf'],
    maxAiSuggestionsPerDay: 100,
  },
  PRO: {
    maxKbArticles: 5000,
    maxStorageBytes: 10 * 1024 * 1024 * 1024, // 10GB
    maxFileSizeBytes: 25 * 1024 * 1024, // 25MB
    allowedInsertionModes: ['quick_add', 'full_form', 'from_chat', 'file_upload'],
    allowedFileTypes: [
      'text/plain',
      'text/markdown',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxAiSuggestionsPerDay: 500,
  },
  ENTERPRISE: {
    maxKbArticles: 999999,
    maxStorageBytes: 100 * 1024 * 1024 * 1024, // 100GB
    maxFileSizeBytes: 100 * 1024 * 1024, // 100MB
    allowedInsertionModes: ['quick_add', 'full_form', 'from_chat', 'file_upload'],
    allowedFileTypes: [
      'text/plain',
      'text/markdown',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxAiSuggestionsPerDay: 999999,
  },
};

// Badge labels for locked features
export const MODE_UPGRADE_BADGES: Record<string, Partial<Record<InsertionMode, string>>> = {
  FREE: { file_upload: 'Pro', from_chat: 'Starter' },
  STARTER: { file_upload: 'Pro' },
  PRO: {},
  ENTERPRISE: {},
};

// Human-readable mode labels
export const INSERTION_MODE_LABELS: Record<InsertionMode, { label: string; description: string; icon: string }> = {
  quick_add: { label: 'Quick Add', description: 'Cole ou digite a solução', icon: 'Zap' },
  file_upload: { label: 'Upload de Arquivo', description: 'PDF, DOC, TXT, MD', icon: 'FileText' },
  full_form: { label: 'Formulário Completo', description: 'Artigo detalhado com editor', icon: 'FileEdit' },
  from_chat: { label: 'Salvar do Chat', description: 'Transformar atendimento', icon: 'MessageSquare' },
};

export function getKbLimits(planId: PlanTier): KbPlanLimits {
  return KB_PLAN_LIMITS[planId];
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

export function getUpgradeRequiredPlan(
  currentPlan: PlanTier,
  mode: InsertionMode
): string | null {
  const tiers: PlanTier[] = ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'];
  for (const tier of tiers) {
    if (KB_PLAN_LIMITS[tier].allowedInsertionModes.includes(mode)) {
      const currentIdx = tiers.indexOf(currentPlan);
      const requiredIdx = tiers.indexOf(tier);
      if (requiredIdx > currentIdx) return tier;
      return null;
    }
  }
  return null;
}
