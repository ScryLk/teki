export interface ChatContext {
  screenshot?: string;
  screenshotMimeType?: string;
  activeWindow?: string;
  detectedErrors?: string[];
  sistema?: string;
  versao?: string;
  ambiente?: string;
}

const TEKI_API_URL = (import.meta.env.VITE_TEKI_API_URL as string | undefined) ?? '';
const OLLAMA_URL = (import.meta.env.VITE_OLLAMA_URL as string | undefined) ?? 'http://localhost:11434';
const OLLAMA_MODEL = (import.meta.env.VITE_OLLAMA_MODEL as string | undefined) ?? 'gemma3:4b';

const SYSTEM_PROMPT = `Você é o Teki, um assistente de suporte técnico com IA integrado ao desktop do usuário.
Você tem acesso visual à tela do usuário quando ele está monitorando uma janela.
Responda sempre em português do Brasil. Seja direto, técnico e prático.`;

function useOllama(): boolean {
  return !TEKI_API_URL;
}

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

  // Attach image to the last user message if available
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

export async function sendMessage(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  context?: ChatContext,
  model?: string
): Promise<Response> {
  if (useOllama()) {
    return sendViaOllama(messages, context);
  }

  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const screenshot = context?.screenshot;

  const body: Record<string, unknown> = {
    messages,
    stream: true,
  };

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

export async function* parseSSEStream(
  response: Response
): AsyncGenerator<string, void, undefined> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Response body is not readable');

  const decoder = new TextDecoder();
  let buffer = '';
  const isOllama = useOllama();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.trim()) continue;

        if (isOllama) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.message?.content) yield parsed.message.content;
            if (parsed.done) return;
          } catch {
            // skip malformed
          }
        } else {
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
    }
  } finally {
    reader.releaseLock();
  }
}
