import type {
  SttOrigin,
  SttProviderId,
  SttPolicy,
  SttFallbackReason,
} from '@teki/shared';

// ─── STT provider abstraction (mirrors lib/ai provider contract) ─────────────
// Raw audio is held in memory only (Buffer) and discarded after transcription.

export interface SttAudioChunk {
  /** WAV audio (16kHz mono PCM recommended). Never persisted. */
  buffer: Buffer;
  mimeType: string;
  durationMs: number;
}

export interface SttContext {
  /** BCP-47 language hint, e.g. 'pt'. */
  language?: string;
  /** Latency budget for this transcription attempt, in ms. */
  latencyBudgetMs?: number;
}

export interface SttResult {
  text: string;
  /** Engine-reported confidence in [0, 1]; null when unavailable. */
  confidence: number | null;
  origin: SttOrigin;
  providerId: SttProviderId;
  latencyMs: number;
}

export interface SttProvider {
  id: SttProviderId;
  origin: SttOrigin;
  /** Cheap availability check (config present, sidecar reachable flag, etc.). */
  isConfigured(): boolean;
  transcribe(chunk: SttAudioChunk, ctx: SttContext): Promise<SttResult>;
}

// ─── Routing policy ───────────────────────────────────────────────────────────

export interface SttRoutePolicy {
  sttPolicy: SttPolicy;
  cloudOptIn: boolean;
  latencyBudgetMs: number;
}

export interface SttRouteOutcome {
  result: SttResult;
  /** Present when a cloud fallback happened — must be audited by the caller. */
  fallback?: { reason: SttFallbackReason };
}
