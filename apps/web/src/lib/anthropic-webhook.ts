const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL = 'claude-sonnet-4-6';
const ANTHROPIC_VERSION = '2023-06-01';

export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

type AnthropicTextPart = { type: 'text'; text: string };
type AnthropicImagePart = {
  type: 'image';
  source: { type: 'base64'; media_type: 'image/png' | 'image/jpeg'; data: string };
};
type AnthropicPart = AnthropicTextPart | AnthropicImagePart;

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string | AnthropicPart[];
}

// ── Mock mode ─────────────────────────────────────────────────────────────────
// Set MOCK_AI=true in .env.local to skip the Anthropic API call during local tests.

function mockResponse(message: string, history: ChatHistoryMessage[], hasImage: boolean): string {
  const turn = Math.floor(history.length / 2) + 1;
  const imageNote = hasImage ? ' Recebi também uma imagem — em modo mock não faço análise visual.' : '';
  return [
    `[MOCK — turno ${turn}]${imageNote}`,
    '',
    `Você perguntou: "${message.slice(0, 120)}${message.length > 120 ? '…' : ''}"`,
    '',
    'Resposta simulada do Teki:',
    '1. Verifique se o problema ocorre em outro dispositivo.',
    '2. Reinicie o serviço afetado.',
    '3. Se persistir, envie logs para análise.',
    '',
    '_Esta é uma resposta de teste. Configure ANTHROPIC_API_KEY para respostas reais._',
  ].join('\n');
}

export async function chatWithAnthropic({
  systemPrompt,
  history,
  message,
  screenshot,
  mimeType = 'image/jpeg',
}: {
  systemPrompt: string;
  history: ChatHistoryMessage[];
  message: string;
  screenshot?: string | null;
  mimeType?: 'image/png' | 'image/jpeg';
}): Promise<string> {
  if (process.env.MOCK_AI === 'true') {
    await new Promise((r) => setTimeout(r, 400)); // simula latência
    return mockResponse(message, history, !!screenshot);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY não configurada no servidor.');
  }

  // Build history messages
  const anthropicMessages: AnthropicMessage[] = history.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // Build the current user message (with optional screenshot)
  const userParts: AnthropicPart[] = [];
  if (screenshot) {
    userParts.push({
      type: 'image',
      source: { type: 'base64', media_type: mimeType, data: screenshot },
    });
  }
  userParts.push({ type: 'text', text: message });

  anthropicMessages.push({
    role: 'user',
    content: screenshot ? userParts : message,
  });

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: anthropicMessages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const text: string = data.content?.[0]?.text ?? '';
  return text;
}
