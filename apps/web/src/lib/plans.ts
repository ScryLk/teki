import type { PlanTier } from '@prisma/client';

export interface PlanDefinition {
  id: PlanTier;
  name: string;
  price: number;
  description: string;
  limits: {
    messagesPerMonth: number;
    agents: number;
    documentsPerAgent: number;
    kbSizeMB: number;
    conversationRetentionDays: number;
  };
  features: {
    models: string[];
    modelSelection: boolean;
    byok: boolean;
    openclaw: boolean;
    openclawChannels: number;
    prioritySupport: boolean;
  };
  badge?: string;
  highlighted?: boolean;
}

export const PLANS: Record<PlanTier, PlanDefinition> = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    price: 0,
    description: 'Para experimentar o Teki',
    limits: {
      messagesPerMonth: 50,
      agents: 1,
      documentsPerAgent: 2,
      kbSizeMB: 5,
      conversationRetentionDays: 7,
    },
    features: {
      models: ['gemini-flash'],
      modelSelection: false,
      byok: false,
      openclaw: false,
      openclawChannels: 0,
      prioritySupport: false,
    },
  },
  STARTER: {
    id: 'STARTER',
    name: 'Starter',
    price: 29,
    description: 'Para tecnicos que usam o Teki todo dia',
    limits: {
      messagesPerMonth: 500,
      agents: 1,
      documentsPerAgent: 5,
      kbSizeMB: 25,
      conversationRetentionDays: 30,
    },
    features: {
      models: ['gemini-flash', 'gpt-4o-mini', 'claude-haiku'],
      modelSelection: true,
      byok: false,
      openclaw: false,
      openclawChannels: 0,
      prioritySupport: false,
    },
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    price: 79,
    description: 'Para equipes de suporte que precisam de tudo',
    badge: 'POPULAR',
    highlighted: true,
    limits: {
      messagesPerMonth: 2000,
      agents: 5,
      documentsPerAgent: 50,
      kbSizeMB: 100,
      conversationRetentionDays: -1,
    },
    features: {
      models: [
        'gemini-flash',
        'gemini-pro',
        'gpt-4o-mini',
        'gpt-4o',
        'claude-haiku',
        'claude-sonnet',
        'ollama-custom',
      ],
      modelSelection: true,
      byok: true,
      openclaw: true,
      openclawChannels: 3,
      prioritySupport: true,
    },
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: -1,
    description: 'Para grandes operacoes de TI',
    limits: {
      messagesPerMonth: 999999,
      agents: 999,
      documentsPerAgent: 999,
      kbSizeMB: 10000,
      conversationRetentionDays: -1,
    },
    features: {
      models: [
        'gemini-flash',
        'gemini-pro',
        'gpt-4o-mini',
        'gpt-4o',
        'claude-haiku',
        'claude-sonnet',
        'ollama-custom',
      ],
      modelSelection: true,
      byok: true,
      openclaw: true,
      openclawChannels: 999,
      prioritySupport: true,
    },
  },
};

export const PLAN_ORDER: PlanTier[] = ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'];

export function getPlan(planId: PlanTier): PlanDefinition {
  return PLANS[planId];
}

export function isUpgrade(from: PlanTier, to: PlanTier): boolean {
  return PLAN_ORDER.indexOf(to) > PLAN_ORDER.indexOf(from);
}

export function isDowngrade(from: PlanTier, to: PlanTier): boolean {
  return PLAN_ORDER.indexOf(to) < PLAN_ORDER.indexOf(from);
}
