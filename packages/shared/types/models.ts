export type AIProviderId = 'gemini' | 'openai' | 'anthropic' | 'ollama' | 'deepseek' | 'groq';

export interface AIModel {
  id: string;
  providerId: AIProviderId;
  apiModelId: string;
  name: string;
  description: string;
  tier: 'free' | 'starter' | 'pro';
  capabilities: {
    vision: boolean;
    streaming: boolean;
    functionCalling: boolean;
    maxContextTokens: number;
    maxOutputTokens: number;
  };
  costTier: 'low' | 'medium' | 'high';
  isDefault: boolean;
  category?: 'chat' | 'reasoning' | 'fast' | 'vision' | 'code';
  speedTier?: 'fast' | 'medium' | 'slow';
  qualityTier?: 'low' | 'medium' | 'high' | 'premium';
  inputPricePerMtok?: number;
  outputPricePerMtok?: number;
  recommended?: boolean;
}

export interface AIProviderMeta {
  id: AIProviderId;
  name: string;
  icon: string;
  color: string;
  keyPlaceholder: string;
  keyValidationPattern?: string;
  documentationUrl: string;
  authType: 'api_key' | 'oauth' | 'none';
  defaultBaseUrl?: string;
}
