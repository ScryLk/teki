import type { SttAudioChunk, SttContext, SttProvider, SttResult } from './types';

// ─── LocalWhisperProvider ─────────────────────────────────────────────────────
// Default STT provider → origin 'local' ([BASE LOCAL] transcription path).
// Talks to a self-hosted faster-whisper/whisper.cpp sidecar exposing the
// OpenAI-compatible POST /v1/audio/transcriptions endpoint (e.g. `speaches`,
// `faster-whisper-server` or `whisper.cpp --server`). Configure via:
//   WHISPER_BASE_URL  (default http://localhost:9000)
//   WHISPER_MODEL     (default 'Systran/faster-whisper-small')

const DEFAULT_TIMEOUT_MS = 8000;

export class LocalWhisperProvider implements SttProvider {
  id = 'local-whisper' as const;
  origin = 'local' as const;

  private baseUrl: string;
  private model: string;

  constructor(baseUrl?: string, model?: string) {
    this.baseUrl =
      baseUrl ?? process.env.WHISPER_BASE_URL ?? 'http://localhost:9000';
    this.model =
      model ?? process.env.WHISPER_MODEL ?? 'Systran/faster-whisper-small';
  }

  isConfigured(): boolean {
    // The sidecar is local infrastructure: a base URL is always resolvable.
    // Reachability failures surface as 'local_unavailable' in the router.
    return true;
  }

  async transcribe(chunk: SttAudioChunk, ctx: SttContext): Promise<SttResult> {
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
      const res = await fetch(`${this.baseUrl}/v1/audio/transcriptions`, {
        method: 'POST',
        body: form,
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Local whisper error: HTTP ${res.status}`);
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
