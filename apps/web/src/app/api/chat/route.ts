import { NextRequest } from 'next/server';

export const runtime = 'edge';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const ALGOLIA_API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!;
const ALGOLIA_AGENT_ID = process.env.NEXT_PUBLIC_ALGOLIA_AGENT_ID!;

export async function POST(req: NextRequest) {
  const { messages, context } = await req.json();

  // Convert from { role, content } to Algolia format { role, parts: [{ text }] }
  const algoliaMessages = toAlgoliaFormat(messages, context);

  const response = await fetch(
    `https://${ALGOLIA_APP_ID}.algolia.net/agent-studio/1/agents/${ALGOLIA_AGENT_ID}/completions?stream=true&compatibilityMode=ai-sdk-5`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-algolia-application-id': ALGOLIA_APP_ID,
        'X-Algolia-API-Key': ALGOLIA_API_KEY,
      },
      body: JSON.stringify({ messages: algoliaMessages }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Algolia Agent Studio error:', response.status, errorText);
    return new Response(
      JSON.stringify({ error: 'Erro na comunicação com Algolia Agent Studio', details: errorText }),
      { status: response.status, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

function toAlgoliaFormat(
  messages: Array<{ role: string; content: string }>,
  context?: {
    sistema?: string;
    versao?: string;
    ambiente?: string;
    sistemaOperacional?: string;
    mensagemErro?: string;
    nivelTecnico?: string;
  }
) {
  // Build context block
  const contextBlock = context
    ? [
        '[CONTEXTO DO ATENDIMENTO]',
        context.sistema && `Sistema: ${context.sistema}`,
        context.versao && `Versão: ${context.versao}`,
        context.ambiente && `Ambiente: ${context.ambiente}`,
        context.sistemaOperacional && `S.O.: ${context.sistemaOperacional}`,
        context.mensagemErro && `Erro reportado: ${context.mensagemErro}`,
        context.nivelTecnico && `Nível técnico do analista: ${context.nivelTecnico}`,
        '[FIM DO CONTEXTO]',
      ]
        .filter(Boolean)
        .join('\n')
    : '';

  const lastUserIndex = messages.findLastIndex(
    (m: { role: string }) => m.role === 'user'
  );

  // Convert each message to Algolia Agent Studio format: { role, parts: [{ text }] }
  return messages.map((msg: { role: string; content: string }, i: number) => {
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
