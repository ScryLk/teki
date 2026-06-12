// ─── Voice Listening (call assistance) types ─────────────────────────────────
// Audio trigger analogous to screen inspection: the desktop app captures the
// VoIP call in two separate channels (A = technician mic, B = system loopback
// with the reporter's voice), segments channel B into utterances via VAD and
// sends each finished utterance to the web API, which transcribes it (hybrid
// STT) and runs the suggestion trigger pipeline.
//
// LGPD invariant: raw audio is NEVER persisted — it is processed in memory
// and discarded. Only transcriptions may be persisted, behind tenant opt-in
// and with a short retention window.

/** Which audio channel an utterance came from. The trigger only reads 'loopback'. */
export type VoiceChannel = 'mic' | 'loopback';

/** Where the transcription was produced. Propagated up to the suggestion card. */
export type SttOrigin = 'local' | 'cloud';

export type SttProviderId = 'local-whisper' | 'groq-whisper';

/** Tenant-level STT policy. 'local_only' must NEVER fall back to cloud. */
export type SttPolicy = 'local_only' | 'hybrid';

/** Why the STT router decided to fall back to a cloud provider (auditable). */
export type SttFallbackReason =
  | 'latency_budget_exceeded'
  | 'local_unavailable'
  | 'local_error'
  | 'tenant_policy';

/** A finished utterance from the reporter (channel B), delimited by VAD pauses. */
export interface VoiceUtterance {
  /** Voice session this utterance belongs to. */
  sessionId: string;
  channel: VoiceChannel;
  /** Base64-encoded WAV (16kHz mono PCM). In-memory only — never persisted. */
  audioBase64: string;
  mimeType: 'audio/wav';
  durationMs: number;
  capturedAt: string; // ISO timestamp
}

export interface TranscriptionResult {
  text: string;
  /** STT engine confidence in [0, 1] when available; null when the engine doesn't report it. */
  confidence: number | null;
  origin: SttOrigin;
  providerId: SttProviderId;
  latencyMs: number;
  /** Set when a cloud fallback happened (audited as stt.fallback.cloud). */
  fallbackReason?: SttFallbackReason;
}

/** Confidence labels reused from the existing AI confidence system. */
export type VoiceSuggestionClassification = 'BASE_LOCAL' | 'INFERIDO' | 'GENERICO';

/** How the suggestion should surface in the floating assistant. */
export type VoiceSuggestionMode =
  /** [BASE LOCAL] >= threshold → pushed automatically as a non-intrusive card. */
  | 'push'
  /** [INFERIDO] → discreet "tenho uma ideia" badge the technician can expand. */
  | 'badge';

export interface VoiceSuggestion {
  id: string;
  sessionId: string;
  text: string;
  /** Confidence percentage 0–100 from the existing 8-signal scorer. */
  confidencePercentage: number;
  classification: VoiceSuggestionClassification;
  /** Display label, e.g. '[BASE LOCAL]'. */
  confidenceLabel: string;
  mode: VoiceSuggestionMode;
  /** Origin of the transcription that triggered this suggestion. */
  sttOrigin: SttOrigin;
  /** KB sources backing the suggestion (filenames), for transparency. */
  sources: string[];
  createdAt: string; // ISO timestamp
}

export type VoiceSessionStatus = 'active' | 'ended';

/** Effective config returned by the API when a voice session starts. */
export interface VoiceSessionConfig {
  /** Minimum confidence (0–1) for an automatic push of a BASE_LOCAL suggestion. */
  triggerThreshold: number;
  /** Rolling context window over the reporter's utterances, in seconds. */
  contextWindowSec: number;
  /** Cooldown per topic after a pushed suggestion, in seconds. */
  cooldownSec: number;
  sttPolicy: SttPolicy;
  cloudOptIn: boolean;
  /** Remaining minutes in the monthly quota; null = unlimited (Enterprise). */
  remainingMinutes: number | null;
}

export interface VoiceSessionInfo {
  id: string;
  status: VoiceSessionStatus;
  startedAt: string;
  config: VoiceSessionConfig;
}

/** Result of posting one utterance to the ingestion endpoint. */
export interface VoiceUtteranceResult {
  transcription: {
    text: string;
    origin: SttOrigin;
    providerId: SttProviderId;
  } | null;
  /** Null when the trigger gate decided not to surface anything. */
  suggestion: VoiceSuggestion | null;
}

// ─── Desktop-side state ───────────────────────────────────────────────────────

export type VoiceCaptureState =
  | 'idle'
  | 'requesting-consent'
  | 'starting'
  | 'listening'
  | 'error';

export interface VoiceStateEvent {
  state: VoiceCaptureState;
  sessionId: string | null;
  error?: string;
}
