import type { SttPolicy } from '../types/voice';

// ─── Voice trigger tuning (defaults; overridable per tenant) ─────────────────

export interface VoiceTriggerConfig {
  /** Minimum confidence (0–1) for an automatic push of a BASE_LOCAL suggestion. */
  triggerThreshold: number;
  /** Rolling context window over the reporter's utterances, in seconds. */
  contextWindowSec: number;
  /** Cooldown per topic after a pushed suggestion, in seconds. */
  cooldownSec: number;
  /** Cheap pre-filter: minimum KB similarity for an utterance to enter the pipeline. */
  prefilterMinSimilarity: number;
  /** Cosine similarity above which two suggestions are considered duplicates. */
  dedupSimilarityThreshold: number;
  /** Latency budget for the local STT provider before hybrid fallback kicks in (ms). */
  sttLatencyBudgetMs: number;
  /** Minimum utterance duration worth transcribing (filters VAD blips), in ms. */
  minUtteranceMs: number;
}

export const DEFAULT_VOICE_TRIGGER_CONFIG: VoiceTriggerConfig = {
  triggerThreshold: 0.75,
  contextWindowSec: 45,
  cooldownSec: 90,
  prefilterMinSimilarity: 0.3,
  dedupSimilarityThreshold: 0.85,
  sttLatencyBudgetMs: 4000,
  minUtteranceMs: 600,
};

export const DEFAULT_STT_POLICY: SttPolicy = 'local_only';

/** Transcript segments (when the tenant opts into persisting them) expire after this. */
export const DEFAULT_TRANSCRIPT_RETENTION_HOURS = 24;

// ─── Audit actions (AuditLog.action) ─────────────────────────────────────────

export const VOICE_AUDIT_ACTIONS = {
  ACTIVATED: 'voice.activated',
  DEACTIVATED: 'voice.deactivated',
  CONSENT_GRANTED: 'voice.consent.granted',
  CONSENT_REVOKED: 'voice.consent.revoked',
  STT_FALLBACK_CLOUD: 'stt.fallback.cloud',
  SUGGESTION_SURFACED: 'suggestion.surfaced',
} as const;

export type VoiceAuditAction =
  (typeof VOICE_AUDIT_ACTIONS)[keyof typeof VOICE_AUDIT_ACTIONS];

// ─── Plan gating ─────────────────────────────────────────────────────────────

export interface VoicePlanLimits {
  enabled: boolean;
  /** Monthly minutes of listening; null = unlimited. */
  monthlyMinutes: number | null;
  /** Policies the plan may use. Enterprise gets local STT by default. */
  allowedSttPolicies: SttPolicy[];
}

export const VOICE_PLAN_LIMITS: Record<
  'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE',
  VoicePlanLimits
> = {
  FREE: { enabled: false, monthlyMinutes: 0, allowedSttPolicies: [] },
  STARTER: { enabled: false, monthlyMinutes: 0, allowedSttPolicies: [] },
  PRO: {
    enabled: true,
    monthlyMinutes: 600,
    allowedSttPolicies: ['local_only', 'hybrid'],
  },
  ENTERPRISE: {
    enabled: true,
    monthlyMinutes: null,
    allowedSttPolicies: ['local_only', 'hybrid'],
  },
};
