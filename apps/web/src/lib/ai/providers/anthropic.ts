import type { AIProviderInterface, ProviderRequest, ProviderResponse, ProviderMessage } from '../types';

const ANTHROPIC_BASE = 'https://api.anthropic.com/v1';
const ANTHROPIC_VERSION = '2023-06-01';

function buildMessages(messages: ProviderMessage[]) {
  return messages
    .filter((m) => m.role !== 'system')
    .map((m) => {
      if (m.image) {
        return {
          role: m.role,
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: m.image.mimeType, data: m.image.base64 },
            },
            { type: 'text', text: m.content },
          ],
        };
      }
      return { role: m.role, content: m.content };
    });
}

function getSystem(request: ProviderRequest): string {
  return request.messages.find((m) => m.role === 'system')?.content ?? request.systemPrompt;
}

export class AnthropicProvider implements AIProviderInterface {
  id = 'anthropic';

  constructor(private apiKey: string) {}

  async chat(request: ProviderRequest): Promise<ProviderResponse> {
    const res = await fetch(`${ANTHROPIC_BASE}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: request.model,
        system: getSystem(request),
        messages: buildMessages(request.messages),
        max_tokens: request.maxTokens ?? 2048,
        temperature: request.temperature ?? 0.5,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return {
      content: data.content?.[0]?.text ?? '',
      model: data.model ?? request.model,
      usage: {
        inputTokens: data.usage?.input_tokens ?? 0,
        outputTokens: data.usage?.output_tokens ?? 0,
      },
    };
  }

  async chatStream(request: ProviderRequest): Promise<ReadableStream<Uint8Array>> {
    const res = await fetch(`${ANTHROPIC_BASE}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: request.model,
        system: getSystem(request),
        messages: buildMessages(request.messages),
        max_tokens: request.maxTokens ?? 2048,
        temperature: request.temperature ?? 0.5,
        stream: true,
      }),
    });

    if (!res.ok || !res.body) {
      const err = await res.text();
      throw new Error(`Anthropic stream error ${res.status}: ${err}`);
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
            try {
              const parsed = JSON.parse(json);
              if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
                const text = parsed.delta.text;
                if (text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                }
              } else if (parsed.type === 'message_stop') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
                return;
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
