import type { AIProviderInterface, ProviderRequest, ProviderResponse } from '../types';

const OPENAI_BASE = 'https://api.openai.com/v1';

function buildMessages(request: ProviderRequest) {
  const messages: unknown[] = [];

  // System message
  const systemContent = request.messages.find((m) => m.role === 'system')?.content ?? request.systemPrompt;
  if (systemContent) {
    messages.push({ role: 'system', content: systemContent });
  }

  for (const m of request.messages.filter((m) => m.role !== 'system')) {
    if (m.image) {
      messages.push({
        role: m.role,
        content: [
          { type: 'image_url', image_url: { url: `data:${m.image.mimeType};base64,${m.image.base64}` } },
          { type: 'text', text: m.content },
        ],
      });
    } else {
      messages.push({ role: m.role, content: m.content });
    }
  }

  return messages;
}

export class OpenAIProvider implements AIProviderInterface {
  id = 'openai';

  constructor(private apiKey: string) {}

  async chat(request: ProviderRequest): Promise<ProviderResponse> {
    const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: buildMessages(request),
        temperature: request.temperature ?? 0.5,
        max_tokens: request.maxTokens ?? 2048,
        stream: false,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return {
      content: data.choices?.[0]?.message?.content ?? '',
      model: data.model ?? request.model,
      usage: {
        inputTokens: data.usage?.prompt_tokens ?? 0,
        outputTokens: data.usage?.completion_tokens ?? 0,
      },
    };
  }

  async chatStream(request: ProviderRequest): Promise<ReadableStream<Uint8Array>> {
    const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: buildMessages(request),
        temperature: request.temperature ?? 0.5,
        max_tokens: request.maxTokens ?? 2048,
        stream: true,
      }),
    });

    if (!res.ok || !res.body) {
      const err = await res.text();
      throw new Error(`OpenAI stream error ${res.status}: ${err}`);
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
            if (json === '[DONE]') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
              return;
            }
            try {
              const parsed = JSON.parse(json);
              const text = parsed.choices?.[0]?.delta?.content;
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
