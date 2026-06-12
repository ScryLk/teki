import { createHash } from 'crypto';
import type {
  VoiceSuggestionClassification,
  VoiceSuggestionMode,
} from '@teki/shared';

// ─── Pure trigger logic (no I/O) ─────────────────────────────────────────────
// Rolling context window, confidence gate, dedup and cooldown for the voice
// trigger pipeline. Kept side-effect free so it can be unit tested.

export interface WindowedUtterance {
  text: string;
  /** Epoch ms when the utterance finished. */
  at: number;
}

export interface SurfacedSuggestion {
  hash: string;
  embedding: number[] | null;
  topicKey: string | null;
  at: number;
}

export interface SessionTriggerState {
  utterances: WindowedUtterance[];
  surfaced: SurfacedSuggestion[];
  /** topicKey → cooldown expiry (epoch ms). */
  cooldowns: Map<string, number>;
}

export function createSessionTriggerState(): SessionTriggerState {
  return { utterances: [], surfaced: [], cooldowns: new Map() };
}

/** Appends an utterance and drops everything older than the rolling window. */
export function appendUtterance(
  state: SessionTriggerState,
  text: string,
  now: number,
  windowMs: number
): void {
  state.utterances.push({ text, at: now });
  const cutoff = now - windowMs;
  state.utterances = state.utterances.filter((u) => u.at >= cutoff);
}

/** Accumulated reporter description over the rolling window. */
export function buildAccumulatedQuery(state: SessionTriggerState): string {
  return state.utterances.map((u) => u.text).join(' ');
}

// ─── Confidence gate ─────────────────────────────────────────────────────────
// Reuses the existing classification system:
//   BASE_LOCAL with score >= threshold → automatic push
//   INFERIDO → discreet badge (technician expands manually)
//   GENERICO → never surfaces on its own

export function decideGate(
  classification: VoiceSuggestionClassification,
  normalizedScore: number,
  triggerThreshold: number
): VoiceSuggestionMode | null {
  if (classification === 'BASE_LOCAL' && normalizedScore >= triggerThreshold) {
    return 'push';
  }
  if (classification === 'INFERIDO') {
    return 'badge';
  }
  return null;
}

// ─── Dedup + cooldown ────────────────────────────────────────────────────────

export function normalizeSuggestionText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function hashSuggestion(text: string): string {
  return createHash('sha256')
    .update(normalizeSuggestionText(text))
    .digest('hex');
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/** True when an equivalent suggestion was already shown in this session. */
export function isDuplicateSuggestion(
  state: SessionTriggerState,
  hash: string,
  embedding: number[] | null,
  similarityThreshold: number
): boolean {
  for (const prev of state.surfaced) {
    if (prev.hash === hash) return true;
    if (
      embedding &&
      prev.embedding &&
      cosineSimilarity(embedding, prev.embedding) >= similarityThreshold
    ) {
      return true;
    }
  }
  return false;
}

export function isTopicInCooldown(
  state: SessionTriggerState,
  topicKey: string | null,
  now: number
): boolean {
  if (!topicKey) return false;
  const expiry = state.cooldowns.get(topicKey);
  return expiry !== undefined && now < expiry;
}

/** Records a surfaced suggestion; pushes also arm the per-topic cooldown. */
export function registerSurfaced(
  state: SessionTriggerState,
  params: {
    hash: string;
    embedding: number[] | null;
    topicKey: string | null;
    mode: 'push' | 'badge';
    now: number;
    cooldownMs: number;
  }
): void {
  state.surfaced.push({
    hash: params.hash,
    embedding: params.embedding,
    topicKey: params.topicKey,
    at: params.now,
  });
  if (params.mode === 'push' && params.topicKey) {
    state.cooldowns.set(params.topicKey, params.now + params.cooldownMs);
  }
}
