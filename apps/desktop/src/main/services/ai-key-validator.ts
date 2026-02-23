import type { AiProviderId, ApiKeyValidationResult } from '@teki/shared';

/**
 * Validates an AI provider API key by making a lightweight request.
 * Runs in the main process — no CORS restrictions.
 */
export async function validateApiKey(
  provider: AiProviderId,
  key: string
): Promise<ApiKeyValidationResult> {
  const start = Date.now();

  try {
    switch (provider) {
      case 'gemini':
        return await validateGemini(key, start);
      case 'openai':
        return await validateOpenAI(key, start);
      case 'anthropic':
        return await validateAnthropic(key, start);
      case 'ollama':
        return await validateOllama(key, start);
      default:
        return result(false, provider as AiProviderId, start, `Provider "${provider}" não suportado.`);
    }
  } catch (error: unknown) {
    return result(false, provider, start, parseError(error));
  }
}

// ─── Gemini ──────────────────────────────────────────────────────────────────

async function validateGemini(apiKey: string, start: number): Promise<ApiKeyValidationResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=5`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    if (response.status === 400 || response.status === 403) {
      return result(false, 'gemini', start, 'API key inválida ou sem permissão.');
    }
    const body = await response.json().catch(() => ({})) as Record<string, unknown>;
    const errObj = body?.error as Record<string, unknown> | undefined;
    return result(false, 'gemini', start, String(errObj?.message ?? `HTTP ${response.status}`));
  }

  const data = await response.json() as { models?: { name?: string }[] };
  const models = (data.models ?? [])
    .map((m) => m.name?.split('/').pop())
    .filter((n): n is string => Boolean(n));

  return result(true, 'gemini', start, undefined, models);
}

// ─── OpenAI ──────────────────────────────────────────────────────────────────

async function validateOpenAI(apiKey: string, start: number): Promise<ApiKeyValidationResult> {
  const response = await fetch('https://api.openai.com/v1/models', {
    method: 'GET',
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    if (response.status === 401) return result(false, 'openai', start, 'API key inválida.');
    if (response.status === 429) return result(true, 'openai', start, undefined, ['rate-limited-but-valid']);
    const body = await response.json().catch(() => ({})) as Record<string, unknown>;
    const errObj = body?.error as Record<string, unknown> | undefined;
    return result(false, 'openai', start, String(errObj?.message ?? `HTTP ${response.status}`));
  }

  const data = await response.json() as { data?: { id: string }[] };
  const gptModels = (data.data ?? [])
    .map((m) => m.id)
    .filter((id) => id.startsWith('gpt-'))
    .slice(0, 10);

  return result(true, 'openai', start, undefined, gptModels);
}

// ─── Anthropic ───────────────────────────────────────────────────────────────

async function validateAnthropic(apiKey: string, start: number): Promise<ApiKeyValidationResult> {
  // Try GET /v1/models first (lighter)
  const modelsRes = await fetch('https://api.anthropic.com/v1/models', {
    method: 'GET',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);

  if (modelsRes?.ok) {
    const data = await modelsRes.json().catch(() => ({ data: [] })) as { data?: { id: string }[] };
    const models = (data.data ?? []).map((m) => m.id).slice(0, 10);
    return result(true, 'anthropic', start, undefined, models);
  }

  // Fallback: POST /v1/messages with 1 token
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'hi' }],
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    if (response.status === 401) return result(false, 'anthropic', start, 'API key inválida.');
    if (response.status === 403) return result(false, 'anthropic', start, 'API key sem permissão ou conta desativada.');
    if (response.status === 429) return result(true, 'anthropic', start);
    const body = await response.json().catch(() => ({})) as Record<string, unknown>;
    const errObj = body?.error as Record<string, unknown> | undefined;
    return result(false, 'anthropic', start, String(errObj?.message ?? `HTTP ${response.status}`));
  }

  return result(true, 'anthropic', start, undefined, ['claude-haiku-4-5-20251001', 'claude-sonnet-4-6']);
}

// ─── Ollama ──────────────────────────────────────────────────────────────────

async function validateOllama(baseUrl: string, start: number): Promise<ApiKeyValidationResult> {
  const url = (baseUrl || 'http://localhost:11434').replace(/\/$/, '');

  const response = await fetch(`${url}/api/tags`, {
    method: 'GET',
    signal: AbortSignal.timeout(5_000),
  });

  if (!response.ok) {
    return result(false, 'ollama', start, `Ollama não respondeu (HTTP ${response.status}). Verifique se está rodando.`);
  }

  const data = await response.json() as { models?: { name: string }[] };
  const models = (data.models ?? []).map((m) => m.name);

  return result(true, 'ollama', start, undefined, models);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function result(
  valid: boolean,
  provider: AiProviderId,
  start: number,
  error?: string,
  models?: string[]
): ApiKeyValidationResult {
  return { valid, provider, error, models, latencyMs: Date.now() - start, checkedAt: new Date().toISOString() };
}

function parseError(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Erro desconhecido na validação.';
  const e = error as Record<string, unknown>;
  if (e.name === 'AbortError' || e.name === 'TimeoutError') return 'Timeout: servidor não respondeu em 10 segundos.';
  if (e.code === 'ECONNREFUSED') return 'Conexão recusada. Verifique se o serviço está rodando.';
  if (e.code === 'ENOTFOUND') return 'Servidor não encontrado. Verifique sua conexão.';
  return String(e.message ?? 'Erro desconhecido na validação.');
}
