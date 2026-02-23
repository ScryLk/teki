import { getModelById } from '@teki/shared';
import type { AIProviderInterface } from './types';
import type { AiRequestOptions, AiResponse, AiStreamChunk } from './types';
import { GeminiProvider } from './providers/gemini';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { OllamaProvider } from './providers/ollama';
import { providerRegistry } from './provider-registry';
import { calculateCost } from './cost-calculator';

// ─── Legacy router (backward-compatible) ──────────────────────────────────────

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
  const provider = providers[model.providerId as keyof typeof providers];
  if (!provider) throw new Error(`Provider "${model.providerId}" não suportado no modo legado.`);

  return { provider, apiModelId: model.apiModelId };
}

// ─── New multi-provider router ────────────────────────────────────────────────

export interface RouterConfig {
  providerId: string;
  modelId: string;
  apiKey: string;
  customBaseUrl?: string;
  fallbackProviderId?: string;
  fallbackModelId?: string;
  fallbackApiKey?: string;
  fallbackBaseUrl?: string;
}

export class ProviderRouter {
  async chat(config: RouterConfig, options: AiRequestOptions): Promise<AiResponse> {
    const provider = providerRegistry.get(config.providerId);
    if (!provider) throw new Error(`Provider ${config.providerId} não encontrado`);

    try {
      const response = await provider.chat(config.apiKey, {
        ...options,
        model: config.modelId,
      }, config.customBaseUrl);

      return response;
    } catch (error) {
      // Try fallback if configured
      if (config.fallbackProviderId && config.fallbackModelId && config.fallbackApiKey) {
        console.warn(`Provider ${config.providerId} falhou, tentando fallback ${config.fallbackProviderId}`);
        const fallbackProvider = providerRegistry.get(config.fallbackProviderId);
        if (fallbackProvider) {
          return fallbackProvider.chat(config.fallbackApiKey, {
            ...options,
            model: config.fallbackModelId,
          }, config.fallbackBaseUrl);
        }
      }
      throw error;
    }
  }

  async *chatStream(config: RouterConfig, options: AiRequestOptions): AsyncGenerator<AiStreamChunk> {
    const provider = providerRegistry.get(config.providerId);
    if (!provider) throw new Error(`Provider ${config.providerId} não encontrado`);

    try {
      yield* provider.chatStream(config.apiKey, {
        ...options,
        model: config.modelId,
      }, config.customBaseUrl);
    } catch (error) {
      if (config.fallbackProviderId && config.fallbackModelId && config.fallbackApiKey) {
        console.warn(`Provider ${config.providerId} stream falhou, tentando fallback ${config.fallbackProviderId}`);
        const fallbackProvider = providerRegistry.get(config.fallbackProviderId);
        if (fallbackProvider) {
          yield* fallbackProvider.chatStream(config.fallbackApiKey, {
            ...options,
            model: config.fallbackModelId,
          }, config.fallbackBaseUrl);
          return;
        }
      }
      throw error;
    }
  }
}

export const providerRouter = new ProviderRouter();
