import type { AIModel } from '../types/models';

export const ALL_MODELS: AIModel[] = [
  // GEMINI
  {
    id: 'gemini-flash',
    providerId: 'gemini',
    apiModelId: 'gemini-2.0-flash',
    name: 'Gemini Flash',
    description: 'Rápido e econômico. Ideal para suporte básico.',
    tier: 'free',
    capabilities: { vision: true, streaming: true, functionCalling: true, maxContextTokens: 1_048_576, maxOutputTokens: 8_192 },
    costTier: 'low',
    isDefault: true,
  },
  {
    id: 'gemini-pro',
    providerId: 'gemini',
    apiModelId: 'gemini-2.5-pro-preview-06-05',
    name: 'Gemini Pro',
    description: 'Mais inteligente. Para problemas complexos.',
    tier: 'pro',
    capabilities: { vision: true, streaming: true, functionCalling: true, maxContextTokens: 1_048_576, maxOutputTokens: 65_536 },
    costTier: 'high',
    isDefault: false,
  },

  // OPENAI
  {
    id: 'gpt-4o-mini',
    providerId: 'openai',
    apiModelId: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Bom equilíbrio qualidade e velocidade.',
    tier: 'starter',
    capabilities: { vision: true, streaming: true, functionCalling: true, maxContextTokens: 128_000, maxOutputTokens: 16_384 },
    costTier: 'low',
    isDefault: false,
  },
  {
    id: 'gpt-4o',
    providerId: 'openai',
    apiModelId: 'gpt-4o',
    name: 'GPT-4o',
    description: 'O melhor da OpenAI. Textos e explicações.',
    tier: 'pro',
    capabilities: { vision: true, streaming: true, functionCalling: true, maxContextTokens: 128_000, maxOutputTokens: 16_384 },
    costTier: 'high',
    isDefault: false,
  },

  // ANTHROPIC
  {
    id: 'claude-haiku',
    providerId: 'anthropic',
    apiModelId: 'claude-haiku-4-5-20251001',
    name: 'Claude Haiku',
    description: 'Rápido e preciso. Respostas diretas.',
    tier: 'starter',
    capabilities: { vision: true, streaming: true, functionCalling: true, maxContextTokens: 200_000, maxOutputTokens: 8_192 },
    costTier: 'low',
    isDefault: false,
  },
  {
    id: 'claude-sonnet',
    providerId: 'anthropic',
    apiModelId: 'claude-sonnet-4-6',
    name: 'Claude Sonnet',
    description: 'O melhor pra código e análise técnica.',
    tier: 'pro',
    capabilities: { vision: true, streaming: true, functionCalling: true, maxContextTokens: 200_000, maxOutputTokens: 16_384 },
    costTier: 'high',
    isDefault: false,
  },

  // OLLAMA
  {
    id: 'ollama-custom',
    providerId: 'ollama',
    apiModelId: 'dynamic',
    name: 'Modelo Local (Ollama)',
    description: 'IA na sua máquina. Privacidade total.',
    tier: 'pro',
    capabilities: { vision: false, streaming: true, functionCalling: false, maxContextTokens: 32_000, maxOutputTokens: 4_096 },
    costTier: 'low',
    isDefault: false,
  },
];

export function getModelById(id: string): AIModel | undefined {
  return ALL_MODELS.find((m) => m.id === id);
}

export function getModelsByTier(tier: 'free' | 'starter' | 'pro'): AIModel[] {
  const tierOrder = { free: 0, starter: 1, pro: 2 };
  return ALL_MODELS.filter((m) => tierOrder[m.tier] <= tierOrder[tier]);
}

export function getDefaultModel(tier: 'free' | 'starter' | 'pro'): AIModel {
  const available = getModelsByTier(tier);
  return available.find((m) => m.isDefault) ?? available[0];
}
