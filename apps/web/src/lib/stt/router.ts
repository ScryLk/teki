import type { SttFallbackReason } from '@teki/shared';
import { LocalWhisperProvider } from './local-whisper';
import { CloudGroqSttProvider } from './cloud-groq';
import type {
  SttAudioChunk,
  SttContext,
  SttProvider,
  SttRoutePolicy,
  SttRouteOutcome,
} from './types';

// ─── STT router (mirrors lib/ai router spirit) ───────────────────────────────
// Local-first: LocalWhisperProvider is always tried first. Cloud fallback is
// only allowed when sttPolicy === 'hybrid' AND cloudOptIn === true, and only
// on explicit, auditable triggers:
//   - latency_budget_exceeded: local exceeded the per-utterance budget
//   - local_unavailable:       sidecar unreachable (machine without resources)
//   - local_error:             sidecar responded with an error
// With sttPolicy 'local_only' or without opt-in, errors propagate — we NEVER
// silently route audio to the cloud.

export function canFallbackToCloud(policy: SttRoutePolicy): boolean {
  return policy.sttPolicy === 'hybrid' && policy.cloudOptIn;
}

export function classifyLocalFailure(err: unknown): SttFallbackReason {
  if (err instanceof Error) {
    if (err.name === 'AbortError' || /abort/i.test(err.message)) {
      return 'latency_budget_exceeded';
    }
    if (/fetch failed|ECONNREFUSED|ENOTFOUND|EAI_AGAIN/i.test(err.message)) {
      return 'local_unavailable';
    }
  }
  return 'local_error';
}

export interface SttRouterDeps {
  local?: SttProvider;
  cloud?: SttProvider;
}

export async function transcribeUtterance(
  chunk: SttAudioChunk,
  ctx: SttContext,
  policy: SttRoutePolicy,
  deps: SttRouterDeps = {}
): Promise<SttRouteOutcome> {
  const local = deps.local ?? new LocalWhisperProvider();
  const cloud = deps.cloud ?? new CloudGroqSttProvider();

  const localCtx: SttContext = {
    ...ctx,
    latencyBudgetMs: policy.latencyBudgetMs,
  };

  try {
    const result = await local.transcribe(chunk, localCtx);
    return { result };
  } catch (err) {
    const reason = classifyLocalFailure(err);

    if (!canFallbackToCloud(policy) || !cloud.isConfigured()) {
      throw err;
    }

    const result = await cloud.transcribe(chunk, ctx);
    return { result, fallback: { reason } };
  }
}
