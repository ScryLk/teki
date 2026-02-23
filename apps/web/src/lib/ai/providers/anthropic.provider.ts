import type { AiProvider, AiRequestOptions, AiResponse, AiStreamChunk } from '../types';

const ANTHROPIC_BASE = 'https://api.anthropic.com/v1';
const ANTHROPIC_VERSION = '2023-06-01';

export class AnthropicAiProvider implements AiProvider {
  id = 'anthropic';
  name = 'Anthropic';

  async validateKey(apiKey: string, baseUrl?: string) {
    try {
      const base = baseUrl ?? ANTHROPIC_BASE;
      // Try GET /v1/models first
      const modelsRes = await fetch(`${base}/models`, {
        method: 'GET',
        headers: { 'x-api-key': apiKey, 'anthropic-version': ANTHROPIC_VERSION },
        signal: AbortSignal.timeout(10_000),
      }).catch(() => null);

      if (modelsRes?.ok) {
        const data = await modelsRes.json() as { data?: { id: string }[] };
        const models = (data.data ?? []).map((m) => m.id).slice(0, 10);
        return { valid: true, models };
      }

      // Fallback: POST /v1/messages with 1 token
      const res = await fetch(`${base}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': ANTHROPIC_VERSION,
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'hi' }],
        }),
        signal: AbortSignal.timeout(10_000),
      });

      if (res.status === 401 || res.status === 403) {
        return { valid: false, error: 'API key inválida ou sem permissão.' };
      }
      if (res.status === 429) {
        return { valid: true }; // rate limited but valid
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as Record<string, unknown>;
        const errObj = body?.error as Record<string, unknown> | undefined;
        return { valid: false, error: String(errObj?.message ?? `HTTP ${res.status}`) };
      }
      return { valid: true, models: ['claude-haiku-4-5-20251001', 'claude-sonnet-4-5-20250929'] };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro na validação.';
      return { valid: false, error: msg };
    }
  }

  async chat(apiKey: string, options: AiRequestOptions, baseUrl?: string): Promise<AiResponse> {
    const base = baseUrl ?? ANTHROPIC_BASE;
    const startTime = Date.now();

    const messages = options.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const systemContent = options.systemPrompt ??
      options.messages.find((m) => m.role === 'system')?.content;

    const res = await fetch(`${base}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: options.model,
        max_tokens: options.maxTokens ?? 2048,
        temperature: options.temperature ?? 0.3,
        ...(systemContent ? { system: systemContent } : {}),
        messages,
      }),
      signal: options.signal,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const content = (data.content ?? [])
      .filter((b: { type: string }) => b.type === 'text')
      .map((b: { text: string }) => b.text)
      .join('');

    return {
      content,
      model: data.model ?? options.model,
      provider: this.id,
      usage: {
        inputTokens: data.usage?.input_tokens ?? 0,
        outputTokens: data.usage?.output_tokens ?? 0,
        totalTokens: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
      },
      finishReason: data.stop_reason === 'end_turn' ? 'stop' : 'max_tokens',
      latencyMs: Date.now() - startTime,
      raw: data,
    };
  }

  async *chatStream(apiKey: string, options: AiRequestOptions, baseUrl?: string): AsyncGenerator<AiStreamChunk> {
    const base = baseUrl ?? ANTHROPIC_BASE;

    const messages = options.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const systemContent = options.systemPrompt ??
      options.messages.find((m) => m.role === 'system')?.content;

    const res = await fetch(`${base}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: options.model,
        max_tokens: options.maxTokens ?? 2048,
        temperature: options.temperature ?? 0.3,
        ...(systemContent ? { system: systemContent } : {}),
        messages,
        stream: true,
      }),
      signal: options.signal,
    });

    if (!res.ok || !res.body) {
      const err = await res.text();
      throw new Error(`Anthropic stream error ${res.status}: ${err}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    let inputTokens = 0;
    let outputTokens = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const json = line.slice(5).trim();
          if (!json) continue;
          try {
            const parsed = JSON.parse(json);
            if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
              yield { content: parsed.delta.text ?? '', done: false };
            } else if (parsed.type === 'message_delta' && parsed.usage) {
              outputTokens = parsed.usage.output_tokens ?? outputTokens;
            } else if (parsed.type === 'message_start' && parsed.message?.usage) {
              inputTokens = parsed.message.usage.input_tokens ?? 0;
            } else if (parsed.type === 'message_stop') {
              yield {
                content: '',
                done: true,
                usage: {
                  inputTokens,
                  outputTokens,
                  totalTokens: inputTokens + outputTokens,
                },
              };
              return;
            }
          } catch { /* skip malformed */ }
        }
      }
    } finally {
      reader.releaseLock();
    }

    yield {
      content: '',
      done: true,
      usage: { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens },
    };
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
