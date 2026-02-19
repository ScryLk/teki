import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

interface ChatRequest {
  systemPrompt: string;
  knowledgeContext: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function chatWithClaude({
  systemPrompt,
  knowledgeContext,
  messages,
  model = 'claude-sonnet-4-20250514',
  temperature = 0.7,
  maxTokens = 2048,
}: ChatRequest) {
  const fullSystemPrompt = buildSystemPrompt(systemPrompt, knowledgeContext);

  const stream = anthropic.messages.stream({
    model,
    max_tokens: maxTokens,
    temperature,
    system: fullSystemPrompt,
    messages,
  });

  return stream;
}

function buildSystemPrompt(customPrompt: string, kbContext: string): string {
  let system = customPrompt;

  if (kbContext.trim()) {
    system += `\n\n---\n\n## Base de Conhecimento\n\nUse as informações abaixo como referência para responder às perguntas do usuário. Se a resposta não estiver na base de conhecimento, informe que não encontrou a informação nos documentos disponíveis, mas tente ajudar com seu conhecimento geral.\n\n${kbContext}`;
  }

  return system;
}

export { anthropic };
