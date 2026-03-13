const GEMINI_MODEL = 'gemini-3-flash-preview';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const SYSTEM_PROMPT = `Você é o Teki, um assistente de suporte técnico com IA integrado ao desktop do usuário.

Você tem acesso visual à tela do usuário quando ele está monitorando uma janela. Quando um screenshot é fornecido, SEMPRE analise visualmente o conteúdo da imagem ao responder.

REGRAS:
1. Se recebeu um screenshot, analise o que está na tela e baseie sua resposta no que você vê
2. Se o usuário perguntar "o que está acontecendo", "o que está na tela", "o que está sendo transmitido" ou similar, descreva o que você vê no screenshot
3. NUNCA diga que não pode ver a tela se um screenshot foi enviado — você pode e deve ver
4. Use seu próprio conhecimento técnico quando a pergunta não estiver visível na tela
5. Seja direto, prático e técnico
6. Responda sempre em português do Brasil`;

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

async function getApiKey(): Promise<string> {
  const fromEnv = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (fromEnv) return fromEnv;

  const fromStore = await window.tekiAPI.getSetting<string>('geminiApiKey');
  if (!fromStore) {
    throw new Error(
      'Chave da API do Gemini não configurada. Adicione VITE_GEMINI_API_KEY no .env.'
    );
  }
  return fromStore;
}

export async function sendMessage(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  screenshotDataUrl?: string | null,
  windowName?: string | null,
  kbContext?: string | null,
): Promise<Response> {
  const apiKey = await getApiKey();

  const lastUserIndex = messages.findLastIndex((m) => m.role === 'user');

  const contents: GeminiContent[] = messages.map((msg, i) => {
    const parts: GeminiPart[] = [];

    // Attach screenshot to the last user message only
    if (i === lastUserIndex && screenshotDataUrl) {
      const base64 = screenshotDataUrl.split(',')[1];
      if (base64) {
        parts.push({ inlineData: { mimeType: 'image/png', data: base64 } });
      }
    }

    // Build text content — prepend window context for the last user message
    let text = msg.content;
    if (i === lastUserIndex && windowName && screenshotDataUrl) {
      text = `[Janela monitorada: "${windowName}"]\n\n${msg.content}`;
    }
    parts.push({ text });

    return {
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts,
    };
  });

  const response = await fetch(
    `${GEMINI_API_BASE}/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: kbContext ? `${SYSTEM_PROMPT}\n\n${kbContext}` : SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  return response;
}

export async function* parseGeminiStream(
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
          const parts = parsed.candidates?.[0]?.content?.parts ?? [];
          for (const part of parts) {
            if (part.text) yield part.text;
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
          const parts = parsed.candidates?.[0]?.content?.parts ?? [];
          for (const part of parts) {
            if (part.text) yield part.text;
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
