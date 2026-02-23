import type { AIProviderInterface, ProviderRequest, ProviderResponse } from '../types';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

function buildContents(request: ProviderRequest) {
  return request.messages
    .filter((m) => m.role !== 'system')
    .map((m) => {
      const parts: unknown[] = [];
      if (m.image) {
        parts.push({ inlineData: { mimeType: m.image.mimeType, data: m.image.base64 } });
      }
      parts.push({ text: m.content });
      return { role: m.role === 'assistant' ? 'model' : 'user', parts };
    });
}

function buildSystemInstruction(request: ProviderRequest): string {
  const systemMsg = request.messages.find((m) => m.role === 'system');
  return systemMsg ? systemMsg.content : request.systemPrompt;
}

export class GeminiProvider implements AIProviderInterface {
  id = 'gemini';

  constructor(private apiKey: string) {}

  async chat(request: ProviderRequest): Promise<ProviderResponse> {
    const url = `${GEMINI_BASE}/${request.model}:generateContent?key=${this.apiKey}`;
    const body = {
      systemInstruction: { parts: [{ text: buildSystemInstruction(request) }] },
      contents: buildContents(request),
      generationConfig: {
        temperature: request.temperature ?? 0.5,
        maxOutputTokens: request.maxTokens ?? 2048,
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return {
      content,
      model: request.model,
      usage: {
        inputTokens: data.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
      },
    };
  }

  async chatStream(request: ProviderRequest): Promise<ReadableStream<Uint8Array>> {
    const url = `${GEMINI_BASE}/${request.model}:streamGenerateContent?alt=sse&key=${this.apiKey}`;
    const body = {
      systemInstruction: { parts: [{ text: buildSystemInstruction(request) }] },
      contents: buildContents(request),
      generationConfig: {
        temperature: request.temperature ?? 0.5,
        maxOutputTokens: request.maxTokens ?? 2048,
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok || !res.body) {
      const err = await res.text();
      throw new Error(`Gemini stream error ${res.status}: ${err}`);
    }

    const encoder = new TextEncoder();
    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    return new ReadableStream<Uint8Array>({
      async pull(controller) {
        let buf = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
            return;
          }
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
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
            } catch {
              // skip malformed
            }
          }
        }
      },
      cancel() { reader.cancel(); },
    });
  }
}
