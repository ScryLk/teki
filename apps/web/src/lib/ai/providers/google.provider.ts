import type { AiProvider, AiRequestOptions, AiResponse, AiStreamChunk } from '../types';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export class GoogleAiProvider implements AiProvider {
  id = 'gemini';
  name = 'Google AI';

  async validateKey(apiKey: string) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=5`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      if (!res.ok) {
        if (res.status === 400 || res.status === 403) {
          return { valid: false, error: 'API key inválida ou sem permissão.' };
        }
        const body = await res.json().catch(() => ({})) as Record<string, unknown>;
        const errObj = body?.error as Record<string, unknown> | undefined;
        return { valid: false, error: String(errObj?.message ?? `HTTP ${res.status}`) };
      }
      const data = await res.json() as { models?: { name?: string }[] };
      const models = (data.models ?? [])
        .map((m) => m.name?.split('/').pop())
        .filter((n): n is string => Boolean(n));
      return { valid: true, models };
    } catch (error: unknown) {
      return { valid: false, error: error instanceof Error ? error.message : 'Erro na validação.' };
    }
  }

  async chat(apiKey: string, options: AiRequestOptions): Promise<AiResponse> {
    const startTime = Date.now();
    const systemContent = options.systemPrompt ??
      options.messages.find((m) => m.role === 'system')?.content;

    const contents = options.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const url = `${GEMINI_BASE}/${options.model}:generateContent?key=${apiKey}`;
    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: options.temperature ?? 0.3,
        maxOutputTokens: options.maxTokens ?? 2048,
        ...(options.jsonMode ? { responseMimeType: 'application/json' } : {}),
      },
    };
    if (systemContent) {
      body.systemInstruction = { parts: [{ text: systemContent }] };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: options.signal,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    return {
      content,
      model: options.model,
      provider: this.id,
      usage: {
        inputTokens: data.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
        totalTokens: data.usageMetadata?.totalTokenCount ?? 0,
      },
      finishReason: 'stop',
      latencyMs: Date.now() - startTime,
      raw: data,
    };
  }

  async *chatStream(apiKey: string, options: AiRequestOptions): AsyncGenerator<AiStreamChunk> {
    const systemContent = options.systemPrompt ??
      options.messages.find((m) => m.role === 'system')?.content;

    const contents = options.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const url = `${GEMINI_BASE}/${options.model}:streamGenerateContent?alt=sse&key=${apiKey}`;
    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: options.temperature ?? 0.3,
        maxOutputTokens: options.maxTokens ?? 2048,
      },
    };
    if (systemContent) {
      body.systemInstruction = { parts: [{ text: systemContent }] };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: options.signal,
    });

    if (!res.ok || !res.body) {
      const err = await res.text();
      throw new Error(`Gemini stream error ${res.status}: ${err}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

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
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              yield { content: text, done: false };
            }
            if (parsed.usageMetadata) {
              totalInputTokens = parsed.usageMetadata.promptTokenCount ?? totalInputTokens;
              totalOutputTokens = parsed.usageMetadata.candidatesTokenCount ?? totalOutputTokens;
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
      usage: {
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        totalTokens: totalInputTokens + totalOutputTokens,
      },
    };
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
