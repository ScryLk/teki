import type { SttAudioChunk, SttContext, SttProvider, SttResult } from './types';

// ─── CloudSttProvider (Groq Whisper) ─────────────────────────────────────────
// Cloud fallback → origin 'cloud'. Only ever reached when the tenant has
// sttPolicy = HYBRID *and* cloudOptIn = true (enforced in router.ts).
// Cost note: Groq whisper-large-v3-turbo bills per audio-minute — every call
// here has direct per-provider cost, which is why the router treats cloud as
// last resort and audits each fallback.

const DEFAULT_TIMEOUT_MS = 10000;

export class CloudGroqSttProvider implements SttProvider {
  id = 'groq-whisper' as const;
  origin = 'cloud' as const;

  private apiKey: string | undefined;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey ?? process.env.GROQ_API_KEY;
    this.model = model ?? process.env.GROQ_STT_MODEL ?? 'whisper-large-v3-turbo';
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async transcribe(chunk: SttAudioChunk, ctx: SttContext): Promise<SttResult> {
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY não configurada para STT em cloud.');
    }

    const start = Date.now();
    const form = new FormData();
    form.append(
      'file',
      new Blob([new Uint8Array(chunk.buffer)], { type: chunk.mimeType }),
      'utterance.wav'
    );
    form.append('model', this.model);
    form.append('language', ctx.language ?? 'pt');
    form.append('response_format', 'json');

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      ctx.latencyBudgetMs ?? DEFAULT_TIMEOUT_MS
    );

    try {
      const res = await fetch(
        'https://api.groq.com/openai/v1/audio/transcriptions',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.apiKey}` },
          body: form,
          signal: controller.signal,
        }
      );

      if (!res.ok) {
        throw new Error(`Groq STT error: HTTP ${res.status}`);
      }

      const data = (await res.json()) as { text?: string };
      return {
        text: (data.text ?? '').trim(),
        confidence: null,
        origin: this.origin,
        providerId: this.id,
        latencyMs: Date.now() - start,
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
