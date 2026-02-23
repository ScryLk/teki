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
