export interface ChatContext {
  screenshot?: string;
  activeWindow?: string;
  detectedErrors?: string[];
  sistema?: string;
  versao?: string;
  ambiente?: string;
}

const TEKI_API_URL = (import.meta.env.VITE_TEKI_API_URL as string | undefined) ?? '';

export async function sendMessage(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  context?: ChatContext,
  model?: string
): Promise<Response> {
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
    body.screenshotMimeType = 'image/png';
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
