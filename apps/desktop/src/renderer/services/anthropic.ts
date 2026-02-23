const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL = 'claude-sonnet-4-6';
const ANTHROPIC_VERSION = '2023-06-01';

const SYSTEM_PROMPT = `Você é o Teki, um assistente de suporte técnico com IA integrado ao desktop do usuário.

Você tem acesso visual à tela do usuário quando ele está monitorando uma janela. Quando um screenshot é fornecido, SEMPRE analise visualmente o conteúdo da imagem ao responder.

REGRAS:
1. Se recebeu um screenshot, analise o que está na tela e baseie sua resposta no que você vê
2. Se o usuário perguntar "o que está acontecendo", "o que está na tela", "o que está sendo transmitido" ou similar, descreva o que você vê no screenshot
3. NUNCA diga que não pode ver a tela se um screenshot foi enviado — você pode e deve ver
4. Use seu próprio conhecimento técnico quando a pergunta não estiver visível na tela
5. Seja direto, prático e técnico
6. Responda sempre em português do Brasil`;

type AnthropicTextContent = { type: 'text'; text: string };
type AnthropicImageContent = {
  type: 'image';
  source: { type: 'base64'; media_type: 'image/png'; data: string };
};
type AnthropicContent = AnthropicTextContent | AnthropicImageContent;

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string | AnthropicContent[];
}

async function getApiKey(): Promise<string> {
  const fromEnv = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
  if (fromEnv) return fromEnv;

  const fromStore = await window.tekiAPI.getSetting<string>('anthropicApiKey');
  if (!fromStore) {
    throw new Error(
      'Chave da API da Anthropic não configurada. Adicione VITE_ANTHROPIC_API_KEY no .env.'
    );
  }
  return fromStore;
}

export async function sendMessage(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  screenshotDataUrl?: string | null,
  windowName?: string | null
): Promise<Response> {
  const apiKey = await getApiKey();

  const lastUserIndex = messages.findLastIndex((m) => m.role === 'user');

  const anthropicMessages: AnthropicMessage[] = messages.map((msg, i) => {
    // For the last user message, attach the screenshot if available
    if (i === lastUserIndex && screenshotDataUrl) {
      const base64 = screenshotDataUrl.split(',')[1];
      const parts: AnthropicContent[] = [
        {
          type: 'image',
          source: { type: 'base64', media_type: 'image/png', data: base64 },
        },
        {
          type: 'text',
          text: windowName
            ? `[Janela monitorada: "${windowName}"]\n\n${msg.content}`
            : msg.content,
        },
      ];
      return { role: 'user', content: parts };
    }

    return { role: msg.role, content: msg.content };
  });

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'content-type': 'application/json',
      // Required for direct browser/renderer access
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 2048,
      stream: true,
      system: SYSTEM_PROMPT,
      messages: anthropicMessages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
  }

  return response;
}

export async function* parseAnthropicStream(
  response: Response
): AsyncGenerator<string, void, undefined> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          if (
            parsed.type === 'content_block_delta' &&
            parsed.delta?.type === 'text_delta' &&
            parsed.delta?.text
          ) {
            yield parsed.delta.text;
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }

    // Flush remaining buffer
    if (buffer.startsWith('data: ')) {
      const data = buffer.slice(6).trim();
      if (data && data !== '[DONE]') {
        try {
          const parsed = JSON.parse(data);
          if (
            parsed.type === 'content_block_delta' &&
            parsed.delta?.type === 'text_delta' &&
            parsed.delta?.text
          ) {
            yield parsed.delta.text;
          }
        } catch {
          // Ignore
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
