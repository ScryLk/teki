import { describe, it, expect } from 'vitest';
import {
  canFallbackToCloud,
  classifyLocalFailure,
  transcribeUtterance,
} from './router';
import type { SttAudioChunk, SttProvider, SttResult } from './types';

const chunk: SttAudioChunk = {
  buffer: Buffer.from('fake'),
  mimeType: 'audio/wav',
  durationMs: 1200,
};

function fakeProvider(
  origin: 'local' | 'cloud',
  behavior: 'ok' | 'abort' | 'unreachable',
  configured = true
): SttProvider {
  return {
    id: origin === 'local' ? 'local-whisper' : 'groq-whisper',
    origin,
    isConfigured: () => configured,
    async transcribe(): Promise<SttResult> {
      if (behavior === 'abort') {
        const err = new Error('The operation was aborted');
        err.name = 'AbortError';
        throw err;
      }
      if (behavior === 'unreachable') {
        throw new Error('fetch failed: ECONNREFUSED');
      }
      return {
        text: `texto-${origin}`,
        confidence: null,
        origin,
        providerId: origin === 'local' ? 'local-whisper' : 'groq-whisper',
        latencyMs: 10,
      };
    },
  };
}

describe('canFallbackToCloud', () => {
  it('requires hybrid policy AND cloud opt-in', () => {
    expect(
      canFallbackToCloud({ sttPolicy: 'hybrid', cloudOptIn: true, latencyBudgetMs: 1 })
    ).toBe(true);
    expect(
      canFallbackToCloud({ sttPolicy: 'hybrid', cloudOptIn: false, latencyBudgetMs: 1 })
    ).toBe(false);
    expect(
      canFallbackToCloud({ sttPolicy: 'local_only', cloudOptIn: true, latencyBudgetMs: 1 })
    ).toBe(false);
  });
});

describe('classifyLocalFailure', () => {
  it('maps aborts to latency_budget_exceeded', () => {
    const err = new Error('aborted');
    err.name = 'AbortError';
    expect(classifyLocalFailure(err)).toBe('latency_budget_exceeded');
  });

  it('maps connection errors to local_unavailable', () => {
    expect(classifyLocalFailure(new Error('fetch failed'))).toBe('local_unavailable');
    expect(classifyLocalFailure(new Error('connect ECONNREFUSED'))).toBe('local_unavailable');
  });

  it('maps anything else to local_error', () => {
    expect(classifyLocalFailure(new Error('HTTP 500'))).toBe('local_error');
  });
});

describe('transcribeUtterance routing', () => {
  it('uses the local provider by default (origin local)', async () => {
    const outcome = await transcribeUtterance(
      chunk,
      {},
      { sttPolicy: 'local_only', cloudOptIn: false, latencyBudgetMs: 4000 },
      { local: fakeProvider('local', 'ok'), cloud: fakeProvider('cloud', 'ok') }
    );
    expect(outcome.result.origin).toBe('local');
    expect(outcome.fallback).toBeUndefined();
  });

  it('NEVER falls back to cloud under local_only policy', async () => {
    await expect(
      transcribeUtterance(
        chunk,
        {},
        { sttPolicy: 'local_only', cloudOptIn: true, latencyBudgetMs: 4000 },
        { local: fakeProvider('local', 'unreachable'), cloud: fakeProvider('cloud', 'ok') }
      )
    ).rejects.toThrow();
  });

  it('NEVER falls back to cloud without tenant opt-in', async () => {
    await expect(
      transcribeUtterance(
        chunk,
        {},
        { sttPolicy: 'hybrid', cloudOptIn: false, latencyBudgetMs: 4000 },
        { local: fakeProvider('local', 'unreachable'), cloud: fakeProvider('cloud', 'ok') }
      )
    ).rejects.toThrow();
  });

  it('falls back to cloud under hybrid + opt-in, reporting the reason', async () => {
    const outcome = await transcribeUtterance(
      chunk,
      {},
      { sttPolicy: 'hybrid', cloudOptIn: true, latencyBudgetMs: 4000 },
      { local: fakeProvider('local', 'abort'), cloud: fakeProvider('cloud', 'ok') }
    );
    expect(outcome.result.origin).toBe('cloud');
    expect(outcome.fallback?.reason).toBe('latency_budget_exceeded');
  });

  it('does not fall back when the cloud provider is not configured', async () => {
    await expect(
      transcribeUtterance(
        chunk,
        {},
        { sttPolicy: 'hybrid', cloudOptIn: true, latencyBudgetMs: 4000 },
        {
          local: fakeProvider('local', 'unreachable'),
          cloud: fakeProvider('cloud', 'ok', false),
        }
      )
    ).rejects.toThrow();
  });
});
