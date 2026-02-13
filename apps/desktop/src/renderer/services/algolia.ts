export interface AlgoliaMessage {
  role: 'user' | 'assistant';
  parts: Array<{ text: string }>;
}

export interface AlgoliaContext {
  screenshot?: string;
  activeWindow?: string;
  detectedErrors?: string[];
  sistema?: string;
  versao?: string;
  ambiente?: string;
}

interface AlgoliaCredentials {
  appId: string;
  apiKey: string;
  agentId: string;
}

async function getCredentials(): Promise<AlgoliaCredentials> {
  const [appId, apiKey, agentId] = await Promise.all([
    window.tekiAPI.getSetting<string>('algoliaAppId'),
    window.tekiAPI.getSetting<string>('algoliaApiKey'),
    window.tekiAPI.getSetting<string>('algoliaAgentId'),
  ]);

  if (!appId || !apiKey || !agentId) {
    throw new Error(
      'Credenciais do Algolia nao configuradas. Verifique as configuracoes.'
    );
  }

  return { appId, apiKey, agentId };
}

function buildContextBlock(context?: AlgoliaContext): string {
  if (!context) return '';

  const lines: string[] = ['[CONTEXTO AUTOMATICO]'];

  if (context.screenshot) {
    lines.push('Tela: screenshot');
  }

  if (context.activeWindow) {
    lines.push(`App ativo: ${context.activeWindow}`);
  }

  if (context.detectedErrors && context.detectedErrors.length > 0) {
    lines.push(`Erros detectados: ${context.detectedErrors.join(', ')}`);
  }

  if (context.sistema) {
    const parts = [context.sistema];
    if (context.versao) parts.push(context.versao);
    if (context.ambiente) parts.push(`(${context.ambiente})`);
    lines.push(`Sistema: ${parts.join(' ')}`);
  }

  lines.push('[FIM DO CONTEXTO]');

  // Only return if there's at least one context field beyond the delimiters
  if (lines.length <= 2) return '';

  return lines.join('\n');
}

function toAlgoliaFormat(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  context?: AlgoliaContext
): AlgoliaMessage[] {
  const contextBlock = buildContextBlock(context);

  const lastUserIndex = messages.findLastIndex((m) => m.role === 'user');

  return messages.map((msg, i) => {
    const text =
      i === lastUserIndex && contextBlock
        ? `${contextBlock}\n\n${msg.content}`
        : msg.content;

    return {
      role: msg.role,
      parts: [{ text }],
    };
  });
}

export async function sendMessage(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  context?: AlgoliaContext
): Promise<Response> {
  const { appId, apiKey, agentId } = await getCredentials();

  const algoliaMessages = toAlgoliaFormat(messages, context);

  const response = await fetch(
    `https://${appId}.algolia.net/agent-studio/1/agents/${agentId}/completions?stream=true&compatibilityMode=ai-sdk-5`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-algolia-application-id': appId,
        'X-Algolia-API-Key': apiKey,
      },
      body: JSON.stringify({ messages: algoliaMessages }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Algolia Agent Studio error (${response.status}): ${errorText}`
    );
  }

  return response;
}

export async function* parseSSEStream(
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
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'text-delta' && parsed.delta) {
            yield parsed.delta;
          }
        } catch {
          // Ignore malformed JSON lines
        }
      }
    }

    // Process any remaining buffer
    if (buffer.startsWith('data: ')) {
      const data = buffer.slice(6);
      if (data !== '[DONE]') {
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'text-delta' && parsed.delta) {
            yield parsed.delta;
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
