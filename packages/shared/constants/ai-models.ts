import type { AIModel, AIProviderMeta, AIProviderId } from '../types/models';

// ═══════════════════════════════════════════════════════════════
// PROVIDER METADATA
// ═══════════════════════════════════════════════════════════════

export const ALL_PROVIDERS: AIProviderMeta[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: 'anthropic',
    color: '#D4A574',
    keyPlaceholder: 'sk-ant-api03-...',
    keyValidationPattern: '^sk-ant-',
    documentationUrl: 'https://docs.anthropic.com',
    authType: 'api_key',
  },
  {
    id: 'gemini',
    name: 'Google AI',
    icon: 'google',
    color: '#4285F4',
    keyPlaceholder: 'AIza...',
    keyValidationPattern: '^AIza',
    documentationUrl: 'https://ai.google.dev/docs',
    authType: 'api_key',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: 'openai',
    color: '#10A37F',
    keyPlaceholder: 'sk-...',
    keyValidationPattern: '^sk-',
    documentationUrl: 'https://platform.openai.com/docs',
    authType: 'api_key',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: 'deepseek',
    color: '#4D6BFE',
    keyPlaceholder: 'sk-...',
    keyValidationPattern: '^sk-',
    documentationUrl: 'https://platform.deepseek.com/docs',
    authType: 'api_key',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
  },
  {
    id: 'groq',
    name: 'Groq',
    icon: 'groq',
    color: '#F55036',
    keyPlaceholder: 'gsk_...',
    keyValidationPattern: '^gsk_',
    documentationUrl: 'https://console.groq.com/docs',
    authType: 'api_key',
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    icon: 'ollama',
    color: '#FFFFFF',
    keyPlaceholder: 'http://localhost:11434',
    documentationUrl: 'https://ollama.com',
    authType: 'none',
    defaultBaseUrl: 'http://localhost:11434',
  },
];

export function getProviderById(id: string): AIProviderMeta | undefined {
  return ALL_PROVIDERS.find((p) => p.id === id);
}

// ═══════════════════════════════════════════════════════════════
// AI MODELS
// ═══════════════════════════════════════════════════════════════

export const ALL_MODELS: AIModel[] = [
  // ─── ANTHROPIC ──────────────────────────────────────────────
  {
    id: 'claude-opus',
    providerId: 'anthropic',
    apiModelId: 'claude-opus-4-5-20250929',
    name: 'Claude Opus 4.5',
    description: 'Máxima inteligência e capacidade.',
    tier: 'pro',
    capabilities: { vision: true, streaming: true, functionCalling: true, maxContextTokens: 200_000, maxOutputTokens: 32_000 },
    costTier: 'high',
    isDefault: false,
    category: 'reasoning',
    speedTier: 'slow',
    qualityTier: 'premium',
    inputPricePerMtok: 15.0,
    outputPricePerMtok: 75.0,
  },
  {
    id: 'claude-sonnet',
    providerId: 'anthropic',
    apiModelId: 'claude-sonnet-4-5-20250929',
    name: 'Claude Sonnet 4.5',
    description: 'Equilíbrio ideal entre qualidade e velocidade.',
    tier: 'pro',
    capabilities: { vision: true, streaming: true, functionCalling: true, maxContextTokens: 200_000, maxOutputTokens: 16_000 },
    costTier: 'high',
    isDefault: false,
    category: 'chat',
    speedTier: 'medium',
    qualityTier: 'high',
    inputPricePerMtok: 3.0,
    outputPricePerMtok: 15.0,
    recommended: true,
  },
  {
    id: 'claude-haiku',
    providerId: 'anthropic',
    apiModelId: 'claude-haiku-4-5-20251001',
    name: 'Claude Haiku 4.5',
    description: 'Rápido e econômico.',
    tier: 'starter',
    capabilities: { vision: true, streaming: true, functionCalling: true, maxContextTokens: 200_000, maxOutputTokens: 8_000 },
    costTier: 'low',
    isDefault: false,
    category: 'fast',
    speedTier: 'fast',
    qualityTier: 'medium',
    inputPricePerMtok: 0.8,
    outputPricePerMtok: 4.0,
  },

  // ─── GOOGLE ─────────────────────────────────────────────────
  {
    id: 'gemini-pro',
    providerId: 'gemini',
    apiModelId: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'Modelo avançado do Google.',
    tier: 'pro',
    capabilities: { vision: true, streaming: true, functionCalling: true, maxContextTokens: 1_048_576, maxOutputTokens: 65_536 },
    costTier: 'high',
    isDefault: false,
    category: 'reasoning',
    speedTier: 'medium',
    qualityTier: 'high',
    inputPricePerMtok: 1.25,
    outputPricePerMtok: 10.0,
    recommended: true,
  },
  {
    id: 'gemini-flash',
    providerId: 'gemini',
    apiModelId: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Rápido e eficiente.',
    tier: 'free',
    capabilities: { vision: true, streaming: true, functionCalling: true, maxContextTokens: 1_048_576, maxOutputTokens: 65_536 },
    costTier: 'low',
    isDefault: true,
    category: 'fast',
    speedTier: 'fast',
    qualityTier: 'medium',
    inputPricePerMtok: 0.15,
    outputPricePerMtok: 0.6,
  },

  // ─── OPENAI ─────────────────────────────────────────────────
  {
    id: 'gpt-4o',
    providerId: 'openai',
    apiModelId: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Modelo principal da OpenAI.',
    tier: 'pro',
    capabilities: { vision: true, streaming: true, functionCalling: true, maxContextTokens: 128_000, maxOutputTokens: 16_384 },
    costTier: 'high',
    isDefault: false,
    category: 'chat',
    speedTier: 'medium',
    qualityTier: 'high',
    inputPricePerMtok: 2.5,
    outputPricePerMtok: 10.0,
    recommended: true,
  },
  {
    id: 'gpt-4o-mini',
    providerId: 'openai',
    apiModelId: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Versão compacta e econômica.',
    tier: 'starter',
    capabilities: { vision: true, streaming: true, functionCalling: true, maxContextTokens: 128_000, maxOutputTokens: 16_384 },
    costTier: 'low',
    isDefault: false,
    category: 'fast',
    speedTier: 'fast',
    qualityTier: 'medium',
    inputPricePerMtok: 0.15,
    outputPricePerMtok: 0.6,
  },
  {
    id: 'o3',
    providerId: 'openai',
    apiModelId: 'o3',
    name: 'o3',
    description: 'Modelo de raciocínio avançado.',
    tier: 'pro',
    capabilities: { vision: true, streaming: true, functionCalling: true, maxContextTokens: 200_000, maxOutputTokens: 100_000 },
    costTier: 'high',
    isDefault: false,
    category: 'reasoning',
    speedTier: 'slow',
    qualityTier: 'premium',
    inputPricePerMtok: 10.0,
    outputPricePerMtok: 40.0,
  },
  {
    id: 'o4-mini',
    providerId: 'openai',
    apiModelId: 'o4-mini',
    name: 'o4-mini',
    description: 'Raciocínio rápido e econômico.',
    tier: 'pro',
    capabilities: { vision: true, streaming: true, functionCalling: true, maxContextTokens: 200_000, maxOutputTokens: 100_000 },
    costTier: 'medium',
    isDefault: false,
    category: 'reasoning',
    speedTier: 'medium',
    qualityTier: 'high',
    inputPricePerMtok: 1.1,
    outputPricePerMtok: 4.4,
  },

  // ─── DEEPSEEK ──────────────────────────────────────────────
  {
    id: 'deepseek-chat',
    providerId: 'deepseek',
    apiModelId: 'deepseek-chat',
    name: 'DeepSeek Chat (V3)',
    description: 'Modelo de chat eficiente e econômico.',
    tier: 'pro',
    capabilities: { vision: false, streaming: true, functionCalling: true, maxContextTokens: 64_000, maxOutputTokens: 8_192 },
    costTier: 'low',
    isDefault: false,
    category: 'chat',
    speedTier: 'fast',
    qualityTier: 'medium',
    inputPricePerMtok: 0.27,
    outputPricePerMtok: 1.10,
  },
  {
    id: 'deepseek-reasoner',
    providerId: 'deepseek',
    apiModelId: 'deepseek-reasoner',
    name: 'DeepSeek Reasoner (R1)',
    description: 'Raciocínio avançado com cadeia de pensamento.',
    tier: 'pro',
    capabilities: { vision: false, streaming: true, functionCalling: false, maxContextTokens: 64_000, maxOutputTokens: 8_192 },
    costTier: 'medium',
    isDefault: false,
    category: 'reasoning',
    speedTier: 'medium',
    qualityTier: 'high',
    inputPricePerMtok: 0.55,
    outputPricePerMtok: 2.19,
  },

  // ─── GROQ ─────────────────────────────────────────────────
  {
    id: 'groq-llama-70b',
    providerId: 'groq',
    apiModelId: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B (Groq)',
    description: 'Velocidade ultra-rápida via Groq.',
    tier: 'pro',
    capabilities: { vision: false, streaming: true, functionCalling: true, maxContextTokens: 128_000, maxOutputTokens: 32_768 },
    costTier: 'low',
    isDefault: false,
    category: 'fast',
    speedTier: 'fast',
    qualityTier: 'medium',
    inputPricePerMtok: 0.59,
    outputPricePerMtok: 0.79,
  },
  {
    id: 'groq-llama-8b',
    providerId: 'groq',
    apiModelId: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B (Groq)',
    description: 'Ultra-rápido e econômico.',
    tier: 'starter',
    capabilities: { vision: false, streaming: true, functionCalling: true, maxContextTokens: 128_000, maxOutputTokens: 8_192 },
    costTier: 'low',
    isDefault: false,
    category: 'fast',
    speedTier: 'fast',
    qualityTier: 'low',
    inputPricePerMtok: 0.05,
    outputPricePerMtok: 0.08,
  },

  // ─── OLLAMA ─────────────────────────────────────────────────
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
    category: 'chat',
    speedTier: 'medium',
    qualityTier: 'medium',
    inputPricePerMtok: 0,
    outputPricePerMtok: 0,
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

export function getModelsByProvider(providerId: AIProviderId): AIModel[] {
  return ALL_MODELS.filter((m) => m.providerId === providerId);
}

export function getProviderIds(): AIProviderId[] {
  return ALL_PROVIDERS.map((p) => p.id);
}
