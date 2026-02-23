import type { AIProviderInterface, ProviderRequest, ProviderResponse } from '../types';

export class OllamaProvider implements AIProviderInterface {
  id = 'ollama';

  constructor(private baseUrl: string = 'http://localhost:11434') {}

  private buildMessages(request: ProviderRequest) {
    const messages = [];
    const system = request.messages.find((m) => m.role === 'system')?.content ?? request.systemPrompt;
    if (system) {
      messages.push({ role: 'system', content: system });
    }
    for (const m of request.messages.filter((m) => m.role !== 'system')) {
      // Ollama doesn't support vision in base mode — skip images
      messages.push({ role: m.role, content: m.content });
    }
    return messages;
  }

  async chat(request: ProviderRequest): Promise<ProviderResponse> {
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: request.model,
        messages: this.buildMessages(request),
        stream: false,
        options: { temperature: request.temperature ?? 0.5 },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Ollama error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return {
      content: data.message?.content ?? '',
      model: data.model ?? request.model,
      usage: {
        inputTokens: data.prompt_eval_count ?? 0,
        outputTokens: data.eval_count ?? 0,
      },
    };
  }

  async chatStream(request: ProviderRequest): Promise<ReadableStream<Uint8Array>> {
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: request.model,
        messages: this.buildMessages(request),
        stream: true,
        options: { temperature: request.temperature ?? 0.5 },
      }),
    });

    if (!res.ok || !res.body) {
      const err = await res.text();
      throw new Error(`Ollama stream error ${res.status}: ${err}`);
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
            if (!line.trim()) continue;
            try {
              const parsed = JSON.parse(line);
              const text = parsed.message?.content;
              if (text) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
              if (parsed.done) {
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
