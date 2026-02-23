export type PlanId = 'free' | 'starter' | 'pro' | 'enterprise';

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  mercadoPagoPreapprovalId?: string;
  limits: {
    agents: number;
    messagesPerMonth: number;
    documentsPerAgent: number;
    kbSizeMB: number;
    models: string[];
    allowModelPerAgent: boolean;
    allowBYOK: boolean;
    conversationRetentionDays: number;
  };
  features: {
    web: boolean;
    desktop: boolean;
    vision: boolean;
    customTray: boolean;
    openclaw: boolean;
    openclawChannels: number;
    onboarding: boolean;
  };
  support: 'community' | 'email' | 'priority';
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    limits: {
      agents: 1,
      messagesPerMonth: 50,
      documentsPerAgent: 2,
      kbSizeMB: 5,
      models: ['gemini-flash'],
      allowModelPerAgent: false,
      allowBYOK: false,
      conversationRetentionDays: 7,
    },
    features: {
      web: true,
      desktop: true,
      vision: true,
      customTray: true,
      openclaw: false,
      openclawChannels: 0,
      onboarding: false,
    },
    support: 'community',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    limits: {
      agents: 1,
      messagesPerMonth: 500,
      documentsPerAgent: 5,
      kbSizeMB: 25,
      models: ['gemini-flash', 'gpt-4o-mini', 'claude-haiku', 'groq-llama-8b'],
      allowModelPerAgent: true,
      allowBYOK: false,
      conversationRetentionDays: 30,
    },
    features: {
      web: true,
      desktop: true,
      vision: true,
      customTray: true,
      openclaw: false,
      openclawChannels: 0,
      onboarding: false,
    },
    support: 'email',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    limits: {
      agents: 5,
      messagesPerMonth: 2000,
      documentsPerAgent: 50,
      kbSizeMB: 100,
      models: ['gemini-flash', 'gemini-pro', 'gpt-4o-mini', 'gpt-4o', 'o3', 'o4-mini', 'claude-haiku', 'claude-sonnet', 'claude-opus', 'deepseek-chat', 'deepseek-reasoner', 'groq-llama-70b', 'groq-llama-8b', 'ollama-custom'],
      allowModelPerAgent: true,
      allowBYOK: true,
      conversationRetentionDays: -1,
    },
    features: {
      web: true,
      desktop: true,
      vision: true,
      customTray: true,
      openclaw: true,
      openclawChannels: 3,
      onboarding: true,
    },
    support: 'priority',
  },
];
