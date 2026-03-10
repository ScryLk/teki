import {
  sendMessage as sendGemini,
  parseGeminiStream,
} from './gemini';
import {
  sendMessage as sendAnthropic,
  parseAnthropicStream,
} from './anthropic';

export interface ChatContext {
  screenshot?: string;
  screenshotMimeType?: string;
  activeWindow?: string;
  detectedErrors?: string[];
  sistema?: string;
  versao?: string;
  ambiente?: string;
}

export type ProviderId = 'ollama' | 'teki' | 'gemini' | 'anthropic';

export interface AiResponse {
  provider: ProviderId;
  stream: AsyncGenerator<string, void, undefined>;
  fallback?: boolean;
  failedProviders?: Array<{ provider: ProviderId; error: string }>;
}

const TEKI_API_URL = (import.meta.env.VITE_TEKI_API_URL as string | undefined) ?? '';
const OLLAMA_URL = (import.meta.env.VITE_OLLAMA_URL as string | undefined) ?? 'http://localhost:11434';
const OLLAMA_MODEL = (import.meta.env.VITE_OLLAMA_MODEL as string | undefined) ?? 'gemma3:4b';

const SYSTEM_PROMPT = `Você é o Teki, um assistente de suporte técnico com IA integrado ao desktop do usuário.
Você tem acesso visual à tela do usuário quando ele está monitorando uma janela.
Responda sempre em português do Brasil. Seja direto, técnico e prático.`;

function usesOllama(): boolean {
  return !TEKI_API_URL;
}

// ─── Provider: Ollama ────────────────────────────────────────────

async function sendViaOllama(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  context?: ChatContext,
): Promise<Response> {
  const ollamaMessages: Array<{ role: string; content: string; images?: string[] }> = [
    { role: 'system', content: SYSTEM_PROMPT },
  ];

  if (context?.activeWindow) {
    ollamaMessages[0].content += `\nJanela ativa do usuário: ${context.activeWindow}`;
  }

  for (const m of messages) {
    ollamaMessages.push({ role: m.role, content: m.content });
  }

  if (context?.screenshot) {
    const lastUserIdx = ollamaMessages.findLastIndex((m) => m.role === 'user');
    if (lastUserIdx >= 0) {
      ollamaMessages[lastUserIdx].images = [context.screenshot];
    }
  }

  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: ollamaMessages,
      stream: true,
      options: { temperature: 0.5 },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Ollama error (${response.status}): ${err}`);
  }

  return response;
}

function parseOllamaStream(response: Response): AsyncGenerator<string, void, undefined> {
  async function* gen(): AsyncGenerator<string, void, undefined> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Response body is not readable');

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.message?.content) yield parsed.message.content;
            if (parsed.done) return;
          } catch {
            // skip malformed
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
  return gen();
}

// ─── Provider: Teki API ──────────────────────────────────────────

async function sendViaTeki(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  context?: ChatContext,
  model?: string,
): Promise<Response> {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const screenshot = context?.screenshot;

  const body: Record<string, unknown> = { messages, stream: true };
  if (model) body.model = model;

  if (context) {
    const { screenshot: _s, ...rest } = context;
    if (Object.values(rest).some(Boolean)) body.context = rest;
  }

  if (screenshot && lastUser) {
    body.screenshot = screenshot;
    body.screenshotMimeType = context?.screenshotMimeType ?? 'image/png';
  }

  const response = await fetch(`${TEKI_API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Teki API error (${response.status}): ${err}`);
  }

  return response;
}

function parseTekiStream(response: Response): AsyncGenerator<string, void, undefined> {
  async function* gen(): AsyncGenerator<string, void, undefined> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Response body is not readable');

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) yield parsed.text;
          } catch {
            // skip malformed
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
  return gen();
}

// ─── Fallback check helpers ──────────────────────────────────────

async function isGeminiAvailable(): Promise<boolean> {
  try {
    const fromEnv = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
    if (fromEnv) return true;
    const fromStore = await window.tekiAPI.getSetting<string>('geminiApiKey');
    return !!fromStore;
  } catch {
    return false;
  }
}

async function isAnthropicAvailable(): Promise<boolean> {
  try {
    const fromEnv = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
    if (fromEnv) return true;
    const fromStore = await window.tekiAPI.getSetting<string>('anthropicApiKey');
    return !!fromStore;
  } catch {
    return false;
  }
}

// ─── Unified send with fallback ──────────────────────────────────

export async function sendMessage(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  context?: ChatContext,
  model?: string,
): Promise<AiResponse> {
  const screenshotDataUrl = context?.screenshot ?? null;
  const windowName = context?.activeWindow ?? null;

  // Build the ordered list of providers to try
  const primary: ProviderId = usesOllama() ? 'ollama' : 'teki';
  const chain: ProviderId[] = [primary];

  // Add fallback providers (Gemini then Anthropic)
  if (await isGeminiAvailable()) chain.push('gemini');
  if (await isAnthropicAvailable()) chain.push('anthropic');
  // If primary is ollama and we have no cloud fallbacks, still try them last
  // (they'll fail with a clear "no key" message, but won't crash)

  const failedProviders: Array<{ provider: ProviderId; error: string }> = [];

  for (let i = 0; i < chain.length; i++) {
    const provider = chain[i];
    try {
      switch (provider) {
        case 'ollama': {
          const response = await sendViaOllama(messages, context);
          return {
            provider,
            stream: parseOllamaStream(response),
            fallback: i > 0,
            failedProviders: failedProviders.length > 0 ? failedProviders : undefined,
          };
        }
        case 'teki': {
          const response = await sendViaTeki(messages, context, model);
          return {
            provider,
            stream: parseTekiStream(response),
            fallback: i > 0,
            failedProviders: failedProviders.length > 0 ? failedProviders : undefined,
          };
        }
        case 'gemini': {
          const response = await sendGemini(messages, screenshotDataUrl, windowName);
          return {
            provider,
            stream: parseGeminiStream(response),
            fallback: i > 0,
            failedProviders: failedProviders.length > 0 ? failedProviders : undefined,
          };
        }
        case 'anthropic': {
          const response = await sendAnthropic(messages, screenshotDataUrl, windowName);
          return {
            provider,
            stream: parseAnthropicStream(response),
            fallback: i > 0,
            failedProviders: failedProviders.length > 0 ? failedProviders : undefined,
          };
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[AI Fallback] ${provider} falhou: ${errorMsg}`);
      failedProviders.push({ provider, error: errorMsg });
      // Continue to next provider
    }
  }

  // All providers failed — throw with details
  const summary = failedProviders
    .map((f) => `${f.provider}: ${f.error}`)
    .join('\n');
  throw new Error(`Todos os provedores de IA falharam:\n${summary}`);
}

// Re-export for backward compatibility
export { parseGeminiStream, parseAnthropicStream };
