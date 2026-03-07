import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseChannel } from '../core/types';
import type { ChannelConfig } from '@teki/shared';

export class GeminiChannel extends BaseChannel {
  id = 'gemini' as const;
  displayName = 'Gemini Live';
  authType = 'apikey' as const;

  private genAI: GoogleGenerativeAI | null = null;

  async connect(config: ChannelConfig): Promise<void> {
    if (!config.apiKey) throw new Error('API Key é obrigatória');

    this.config = config;
    this.emitStatus('waiting', 'Validando API key...');

    try {
      this.genAI = new GoogleGenerativeAI(config.apiKey);

      // Validate by listing models
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent('ping');
      const text = result.response.text();

      if (text) {
        this.emitStatus('connected', 'Gemini 2.0 Flash');
      } else {
        throw new Error('API key inválida');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      this.emitStatus('error', undefined, message);
      this.genAI = null;
      throw err;
    }
  }

  getGenerativeAI(): GoogleGenerativeAI | null {
    return this.genAI;
  }

  async disconnect(): Promise<void> {
    this.genAI = null;
    this.emitStatus('idle');
  }
}
