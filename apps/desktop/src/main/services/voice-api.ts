import settingsStore from './settings-store';
import type {
  VoiceSessionInfo,
  VoiceUtteranceResult,
} from '@teki/shared';

// ─── Voice API client (main process) ─────────────────────────────────────────
// All voice endpoints are authenticated with the desktop API key. Raw audio
// only transits in-memory (base64 in the request body) — it is never written
// to disk or logs on either side.

const API_BASE =
  process.env.TEKI_API_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://teki.com.br');

export interface VoiceApiError {
  code: string;
  message: string;
}

type ApiResult<T> = { ok: true; data: T } | { ok: false; error: VoiceApiError };

function getAuthHeaders(): Record<string, string> | null {
  const apiKey = settingsStore.get('authApiKey' as never) as unknown as string | null;
  if (!apiKey) return null;
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

async function request<T>(
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  body?: unknown
): Promise<ApiResult<T>> {
  const headers = getAuthHeaders();
  if (!headers) {
    return { ok: false, error: { code: 'NOT_AUTHENTICATED', message: 'Não autenticado.' } };
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        error: data?.error ?? { code: `HTTP_${res.status}`, message: `Erro ${res.status}` },
      };
    }
    return { ok: true, data: data as T };
  } catch {
    return {
      ok: false,
      error: { code: 'NETWORK_ERROR', message: 'Sem conexão com o servidor.' },
    };
  }
}

export function getVoiceConsent() {
  return request<{ granted: boolean; recordedAt: string | null }>(
    'GET',
    '/api/v1/voice/consent'
  );
}

export function setVoiceConsent(granted: boolean) {
  return request<{ granted: boolean }>('POST', '/api/v1/voice/consent', { granted });
}

export function startVoiceSession() {
  return request<VoiceSessionInfo>('POST', '/api/v1/voice/sessions', {});
}

export function endVoiceSession(sessionId: string) {
  return request<{ status: string; durationSeconds: number }>(
    'DELETE',
    `/api/v1/voice/sessions/${sessionId}`
  );
}

export function postVoiceUtterance(
  sessionId: string,
  payload: { audioBase64: string; mimeType: string; durationMs: number }
) {
  return request<VoiceUtteranceResult>(
    'POST',
    `/api/v1/voice/sessions/${sessionId}/utterances`,
    payload
  );
}
