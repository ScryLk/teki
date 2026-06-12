import { randomUUID } from 'crypto';
import { prisma } from '../prisma';
import { getProvider } from '../ai/router';
import { searchKnowledgeBase } from '../kb/search';
import { generateEmbedding } from '../kb/embeddings';
import {
  searchWithExpansion,
  formatExpansionContext,
} from '../kb/query-expansion';
import { calculateConfidence } from '../kb/confidence-scorer';
import { logAuditSafe } from './audit-log.service';
import { logDataAccess } from './data-access-log.service';
import {
  appendUtterance,
  buildAccumulatedQuery,
  createSessionTriggerState,
  decideGate,
  hashSuggestion,
  isDuplicateSuggestion,
  isTopicInCooldown,
  registerSurfaced,
  type SessionTriggerState,
} from './voice-trigger-core';
import {
  DEFAULT_VOICE_TRIGGER_CONFIG,
  VOICE_AUDIT_ACTIONS,
  type SttOrigin,
  type VoiceSuggestion,
  type VoiceTriggerConfig,
} from '@teki/shared';

// ═══════════════════════════════════════════════════════════════
// VoiceTriggerService — pipeline per reporter (channel B) utterance:
//   1. cheap local pre-filter (KB embedding similarity)
//   2. rolling accumulated context window
//   3. KB retrieval (lib/kb, pgvector) — reused, not reimplemented
//   4. synthesis via lib/ai router (multi-provider)
//   5. confidence gate reusing the existing 8-signal score + labels
//   6. dedup + per-topic cooldown
// Session state is in-memory (single web instance for the MVP); it is
// keyed by sessionId and dropped when the session ends or goes stale.
// ═══════════════════════════════════════════════════════════════

// Model used for suggestion synthesis: cheapest/fastest in the catalog.
// Cost: ~KB context + short completion per triggered utterance; the
// pre-filter keeps most utterances from ever reaching this stage.
const SUGGESTION_MODEL_ID = 'gemini-flash';

const SUGGESTION_SYSTEM_PROMPT =
  'Você é o Teki, assistente de suporte técnico. Um relator está descrevendo ' +
  'um problema durante uma chamada. Com base APENAS no contexto da base de ' +
  'conhecimento fornecido, sugira a solução de forma curta e acionável ' +
  '(2 a 4 frases ou passos numerados), em português brasileiro. ' +
  'Se a base de conhecimento não cobrir o problema, diga isso explicitamente.';

const STATE_TTL_MS = 2 * 60 * 60 * 1000; // drop stale session state after 2h

interface TrackedState {
  state: SessionTriggerState;
  lastTouchedAt: number;
}

const sessionStates = new Map<string, TrackedState>();

function getSessionState(sessionId: string): SessionTriggerState {
  const now = Date.now();
  // Opportunistic cleanup of stale sessions
  for (const [id, tracked] of sessionStates) {
    if (now - tracked.lastTouchedAt > STATE_TTL_MS) sessionStates.delete(id);
  }
  let tracked = sessionStates.get(sessionId);
  if (!tracked) {
    tracked = { state: createSessionTriggerState(), lastTouchedAt: now };
    sessionStates.set(sessionId, tracked);
  }
  tracked.lastTouchedAt = now;
  return tracked.state;
}

export function clearSessionState(sessionId: string): void {
  sessionStates.delete(sessionId);
}

export interface ProcessUtteranceInput {
  sessionId: string;
  tenantId: string | null;
  userId: string;
  agentId: string;
  /** Transcribed reporter utterance (channel B only). */
  text: string;
  sttOrigin: SttOrigin;
  config?: Partial<VoiceTriggerConfig>;
}

export async function processUtterance(
  input: ProcessUtteranceInput
): Promise<VoiceSuggestion | null> {
  const config: VoiceTriggerConfig = {
    ...DEFAULT_VOICE_TRIGGER_CONFIG,
    ...input.config,
  };
  const now = Date.now();
  const state = getSessionState(input.sessionId);

  // 2. Rolling context window — always accumulate, even when the pre-filter
  // skips this utterance, so later details enrich the description.
  appendUtterance(state, input.text, now, config.contextWindowSec * 1000);

  // 1. Cheap pre-filter: single embedding + direct pgvector lookup. Anything
  // below the similarity floor never reaches expansion/synthesis (cost control).
  const prefilterHits = await searchKnowledgeBase(
    input.agentId,
    input.text,
    3,
    config.prefilterMinSimilarity
  );
  if (prefilterHits.length === 0) {
    return null;
  }

  // 3. Retrieval over the ACCUMULATED description via the existing expansion
  // pipeline (pgvector + progressive layers, budget-controlled).
  const accumulatedQuery = buildAccumulatedQuery(state);
  const expansionResult = await searchWithExpansion({
    agentId: input.agentId,
    query: accumulatedQuery,
  });
  if (expansionResult.finalResults.length === 0) {
    return null;
  }

  // Retrieval touched stored tenant data → DataAccessLog (LGPD Art. 37).
  logDataAccess({
    accessorId: input.userId,
    accessorType: 'system',
    accessorTenantId: input.tenantId ?? undefined,
    subjectId: input.userId,
    action: 'process',
    dataCategories: ['ai_history'],
    details: {
      feature: 'voice_listening',
      sessionId: input.sessionId,
      kbResults: expansionResult.finalResults.length,
    },
    legalBasis: 'CONSENT',
    justification: 'Retrieval de KB para sugestão por voz',
  }).catch(() => {});

  // 4. Synthesis via the multi-provider AI router.
  const kbContext = formatExpansionContext(expansionResult);
  const { provider, apiModelId } = getProvider(SUGGESTION_MODEL_ID);
  const response = await provider.chat({
    model: apiModelId,
    messages: [{ role: 'user', content: accumulatedQuery }],
    systemPrompt: `${SUGGESTION_SYSTEM_PROMPT}\n\n${kbContext}`,
    stream: false,
    maxTokens: 400,
  });

  // 5. Confidence gate reusing the existing scorer (8 signals + labels).
  const confidence = calculateConfidence({
    expansionResult,
    responseText: response.content,
    modelId: SUGGESTION_MODEL_ID,
  });
  const mode = decideGate(
    confidence.classification,
    confidence.normalized,
    config.triggerThreshold
  );
  if (!mode) {
    return null; // GENERICO (or low BASE_LOCAL) never fires on its own
  }

  // 6. Dedup + cooldown. Topic key = best-matching KB document.
  const topicKey = expansionResult.finalResults[0]?.documentId ?? null;
  if (mode === 'push' && isTopicInCooldown(state, topicKey, now)) {
    return null;
  }

  const hash = hashSuggestion(response.content);
  let suggestionEmbedding: number[] | null = null;
  try {
    suggestionEmbedding = await generateEmbedding(response.content);
  } catch {
    // Hash-based dedup still applies when the embedding call fails.
  }
  if (
    isDuplicateSuggestion(
      state,
      hash,
      suggestionEmbedding,
      config.dedupSimilarityThreshold
    )
  ) {
    return null;
  }

  registerSurfaced(state, {
    hash,
    embedding: suggestionEmbedding,
    topicKey,
    mode,
    now,
    cooldownMs: config.cooldownSec * 1000,
  });

  const suggestion: VoiceSuggestion = {
    id: randomUUID(),
    sessionId: input.sessionId,
    text: response.content,
    confidencePercentage: confidence.percentage,
    classification: confidence.classification,
    confidenceLabel: confidence.label,
    mode,
    sttOrigin: input.sttOrigin,
    sources: [
      ...new Set(expansionResult.finalResults.map((r) => r.filename)),
    ],
    createdAt: new Date().toISOString(),
  };

  logAuditSafe({
    action: VOICE_AUDIT_ACTIONS.SUGGESTION_SURFACED,
    tenantId: input.tenantId,
    userId: input.userId,
    resource: `voice_session:${input.sessionId}`,
    details: {
      suggestionId: suggestion.id,
      mode,
      classification: confidence.classification,
      confidence: confidence.percentage,
      sttOrigin: input.sttOrigin,
      topicKey,
    },
  });

  prisma.voiceSession
    .update({
      where: { id: input.sessionId },
      data: { suggestionsSurfaced: { increment: 1 } },
    })
    .catch(() => {});

  return suggestion;
}
