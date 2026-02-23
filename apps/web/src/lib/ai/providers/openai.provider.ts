import type { AiProvider, AiRequestOptions, AiResponse, AiStreamChunk } from '../types';

const OPENAI_BASE = 'https://api.openai.com/v1';

export class OpenAiAiProvider implements AiProvider {
  id = 'openai';
  name = 'OpenAI';

  protected getBaseUrl(baseUrl?: string): string {
    return baseUrl ?? OPENAI_BASE;
  }

  async validateKey(apiKey: string, baseUrl?: string) {
    try {
      const base = this.getBaseUrl(baseUrl);
      const res = await fetch(`${base}/models`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(10_000),
      });
      if (res.status === 401) return { valid: false, error: 'API key inválida.' };
      if (res.status === 429) return { valid: true }; // rate limited but valid
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as Record<string, unknown>;
        const errObj = body?.error as Record<string, unknown> | undefined;
        return { valid: false, error: String(errObj?.message ?? `HTTP ${res.status}`) };
      }
      const data = await res.json() as { data?: { id: string }[] };
      const models = (data.data ?? []).map((m) => m.id).filter((id) => id.startsWith('gpt-') || id.startsWith('o')).slice(0, 10);
      return { valid: true, models };
    } catch (error: unknown) {
      return { valid: false, error: error instanceof Error ? error.message : 'Erro na validação.' };
    }
  }

  async chat(apiKey: string, options: AiRequestOptions, baseUrl?: string): Promise<AiResponse> {
    const base = this.getBaseUrl(baseUrl);
    const startTime = Date.now();

    const messages: Array<{ role: string; content: string }> = [];
    const systemContent = options.systemPrompt ??
      options.messages.find((m) => m.role === 'system')?.content;
    if (systemContent) {
      messages.push({ role: 'system', content: systemContent });
    }
    for (const msg of options.messages.filter((m) => m.role !== 'system')) {
      messages.push({ role: msg.role, content: msg.content });
    }

    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: options.model,
        messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 2048,
        ...(options.jsonMode ? { response_format: { type: 'json_object' } } : {}),
      }),
      signal: options.signal,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const choice = data.choices?.[0];

    return {
      content: choice?.message?.content ?? '',
      model: data.model ?? options.model,
      provider: this.id,
      usage: {
        inputTokens: data.usage?.prompt_tokens ?? 0,
        outputTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
      },
      finishReason: choice?.finish_reason === 'stop' ? 'stop' : 'max_tokens',
      latencyMs: Date.now() - startTime,
      raw: data,
    };
  }

  async *chatStream(apiKey: string, options: AiRequestOptions, baseUrl?: string): AsyncGenerator<AiStreamChunk> {
    const base = this.getBaseUrl(baseUrl);

    const messages: Array<{ role: string; content: string }> = [];
    const systemContent = options.systemPrompt ??
      options.messages.find((m) => m.role === 'system')?.content;
    if (systemContent) {
      messages.push({ role: 'system', content: systemContent });
    }
    for (const msg of options.messages.filter((m) => m.role !== 'system')) {
      messages.push({ role: msg.role, content: msg.content });
    }

    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: options.model,
        messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 2048,
        stream: true,
        stream_options: { include_usage: true },
      }),
      signal: options.signal,
    });

    if (!res.ok || !res.body) {
      const err = await res.text();
      throw new Error(`OpenAI stream error ${res.status}: ${err}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    let usageData: AiStreamChunk['usage'] | undefined;

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
          if (json === '[DONE]') {
            yield { content: '', done: true, usage: usageData };
            return;
          }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content ?? '';
            const finishReason = parsed.choices?.[0]?.finish_reason;
            if (parsed.usage) {
              usageData = {
                inputTokens: parsed.usage.prompt_tokens ?? 0,
                outputTokens: parsed.usage.completion_tokens ?? 0,
                totalTokens: parsed.usage.total_tokens ?? 0,
              };
            }
            if (delta) {
              yield { content: delta, done: false };
            }
            if (finishReason) {
              yield { content: '', done: true, usage: usageData };
              return;
            }
          } catch { /* skip malformed */ }
        }
      }
    } finally {
      reader.releaseLock();
    }

    yield { content: '', done: true, usage: usageData };
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
