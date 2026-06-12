import { describe, it, expect } from 'vitest';
import {
  appendUtterance,
  buildAccumulatedQuery,
  cosineSimilarity,
  createSessionTriggerState,
  decideGate,
  hashSuggestion,
  isDuplicateSuggestion,
  isTopicInCooldown,
  registerSurfaced,
} from './voice-trigger-core';

describe('rolling context window', () => {
  it('accumulates utterances inside the window', () => {
    const state = createSessionTriggerState();
    appendUtterance(state, 'a impressora não imprime', 1000, 45_000);
    appendUtterance(state, 'aparece erro 0x000006ba', 5000, 45_000);
    expect(buildAccumulatedQuery(state)).toBe(
      'a impressora não imprime aparece erro 0x000006ba'
    );
  });

  it('drops utterances older than the window', () => {
    const state = createSessionTriggerState();
    appendUtterance(state, 'antiga', 0, 45_000);
    appendUtterance(state, 'recente', 60_000, 45_000);
    expect(buildAccumulatedQuery(state)).toBe('recente');
  });
});

describe('confidence gate', () => {
  it('pushes BASE_LOCAL at or above the threshold', () => {
    expect(decideGate('BASE_LOCAL', 0.82, 0.75)).toBe('push');
    expect(decideGate('BASE_LOCAL', 0.75, 0.75)).toBe('push');
  });

  it('does not push BASE_LOCAL below the threshold', () => {
    expect(decideGate('BASE_LOCAL', 0.7, 0.75)).toBeNull();
  });

  it('surfaces INFERIDO only as a badge', () => {
    expect(decideGate('INFERIDO', 0.6, 0.75)).toBe('badge');
  });

  it('never fires GENERICO on its own', () => {
    expect(decideGate('GENERICO', 0.99, 0.75)).toBeNull();
  });
});

describe('dedup', () => {
  it('detects exact duplicates via hash (whitespace/case insensitive)', () => {
    const state = createSessionTriggerState();
    const hash = hashSuggestion('Reinicie o spooler de impressão.');
    registerSurfaced(state, {
      hash,
      embedding: null,
      topicKey: 'doc-1',
      mode: 'push',
      now: 1000,
      cooldownMs: 90_000,
    });
    const sameHash = hashSuggestion('  reinicie o spooler   de impressão. ');
    expect(sameHash).toBe(hash);
    expect(isDuplicateSuggestion(state, sameHash, null, 0.85)).toBe(true);
  });

  it('detects near-duplicates via embedding similarity', () => {
    const state = createSessionTriggerState();
    registerSurfaced(state, {
      hash: 'h1',
      embedding: [1, 0, 0],
      topicKey: null,
      mode: 'badge',
      now: 1000,
      cooldownMs: 90_000,
    });
    expect(isDuplicateSuggestion(state, 'h2', [0.99, 0.05, 0], 0.85)).toBe(true);
    expect(isDuplicateSuggestion(state, 'h3', [0, 1, 0], 0.85)).toBe(false);
  });
});

describe('cooldown', () => {
  it('arms the per-topic cooldown only on push', () => {
    const state = createSessionTriggerState();
    registerSurfaced(state, {
      hash: 'h1',
      embedding: null,
      topicKey: 'doc-1',
      mode: 'badge',
      now: 1000,
      cooldownMs: 90_000,
    });
    expect(isTopicInCooldown(state, 'doc-1', 2000)).toBe(false);

    registerSurfaced(state, {
      hash: 'h2',
      embedding: null,
      topicKey: 'doc-1',
      mode: 'push',
      now: 2000,
      cooldownMs: 90_000,
    });
    expect(isTopicInCooldown(state, 'doc-1', 50_000)).toBe(true);
    expect(isTopicInCooldown(state, 'doc-1', 92_001)).toBe(false);
    expect(isTopicInCooldown(state, 'doc-2', 50_000)).toBe(false);
  });
});

describe('cosineSimilarity', () => {
  it('handles edge cases', () => {
    expect(cosineSimilarity([], [])).toBe(0);
    expect(cosineSimilarity([1, 0], [1, 0, 0])).toBe(0);
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
    expect(cosineSimilarity([1, 2], [1, 2])).toBeCloseTo(1);
  });
});
