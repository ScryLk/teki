import type { AiProvider } from './types';
import { AnthropicAiProvider } from './providers/anthropic.provider';
import { GoogleAiProvider } from './providers/google.provider';
import { OpenAiAiProvider } from './providers/openai.provider';
import { DeepSeekAiProvider, GroqAiProvider } from './providers/openai-compat.provider';

class ProviderRegistry {
  private providers = new Map<string, AiProvider>();

  constructor() {
    this.register(new AnthropicAiProvider());
    this.register(new GoogleAiProvider());
    this.register(new OpenAiAiProvider());
    this.register(new DeepSeekAiProvider());
    this.register(new GroqAiProvider());
  }

  register(provider: AiProvider) {
    this.providers.set(provider.id, provider);
  }

  get(id: string): AiProvider | undefined {
    return this.providers.get(id);
  }

  getAll(): AiProvider[] {
    return Array.from(this.providers.values());
  }
}

export const providerRegistry = new ProviderRegistry();
