export type AIProviderId = 'gemini' | 'openai' | 'anthropic' | 'ollama';

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
}
