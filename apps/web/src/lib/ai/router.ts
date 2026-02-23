import { getModelById } from '@teki/shared';
import type { AIProviderInterface } from './types';
import { GeminiProvider } from './providers/gemini';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { OllamaProvider } from './providers/ollama';

function makeProviders(apiKeys?: Record<string, string>) {
  return {
    gemini: new GeminiProvider(apiKeys?.gemini ?? process.env.GEMINI_API_KEY ?? ''),
    openai: new OpenAIProvider(apiKeys?.openai ?? process.env.OPENAI_API_KEY ?? ''),
    anthropic: new AnthropicProvider(apiKeys?.anthropic ?? process.env.ANTHROPIC_API_KEY ?? ''),
    ollama: new OllamaProvider(process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'),
  };
}

export function getProvider(
  modelId: string,
  userApiKeys?: Record<string, string>
): { provider: AIProviderInterface; apiModelId: string } {
  const model = getModelById(modelId);
  if (!model) throw new Error(`Modelo "${modelId}" não encontrado.`);

  const providers = makeProviders(userApiKeys);
  const provider = providers[model.providerId];

  return { provider, apiModelId: model.apiModelId };
}
