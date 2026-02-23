import { OpenAiAiProvider } from './openai.provider';

export class DeepSeekAiProvider extends OpenAiAiProvider {
  override id = 'deepseek';
  override name = 'DeepSeek';

  protected override getBaseUrl(baseUrl?: string): string {
    return baseUrl ?? 'https://api.deepseek.com/v1';
  }
}

export class GroqAiProvider extends OpenAiAiProvider {
  override id = 'groq';
  override name = 'Groq';

  protected override getBaseUrl(baseUrl?: string): string {
    return baseUrl ?? 'https://api.groq.com/openai/v1';
  }
}
