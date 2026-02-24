import { getProvider } from '@/lib/ai/router';
import type {
  QuickAddSuggestion,
  FileUploadSuggestion,
  ChatSuggestion,
  AiSuggestion,
  KbCategoryOption,
} from './types';

// ── Prompts ──

function buildQuickAddPrompt(
  text: string,
  categories: string[],
  existingTags: string[]
): string {
  return `Você é um assistente de documentação técnica. Analise o texto abaixo e extraia um artigo estruturado para uma base de conhecimento de suporte técnico de TI.

CATEGORIAS DISPONÍVEIS:
${categories.join(', ')}

TAGS EXISTENTES:
${existingTags.join(', ')}

TEXTO DO TÉCNICO:
${text}

Retorne APENAS JSON válido (sem markdown, sem code fences) com:
{
  "title": "Título claro e descritivo (máx 100 chars)",
  "summary": "Resumo de 2-3 frases do problema e solução",
  "category": "Nome da categoria mais adequada (das disponíveis)",
  "categoryConfidence": 0.0-1.0,
  "tags": ["tag1", "tag2", "tag3"],
  "difficulty": "basic|intermediate|advanced",
  "targetAudience": "end_user|technician|admin",
  "structuredContent": "Conteúdo reorganizado em Markdown com seções: ## Problema\\n...\\n## Solução\\n...\\n## Observações\\n...",
  "detectedErrorCodes": ["códigos de erro encontrados"],
  "detectedSoftware": ["softwares mencionados"]
}

REGRAS:
- Se o texto for vago, faça o melhor possível e indique baixa confiança
- Use APENAS categorias da lista fornecida. Se nenhuma se encaixar, sugira "Geral"
- Prefira tags já existentes. Crie novas apenas se necessário
- O structuredContent deve ser MAIS organizado que o texto original
- Não invente informação que não está no texto`;
}

function buildFileAnalysisPrompt(
  extractedText: string,
  fileName: string,
  fileType: string,
  categories: string[],
  existingTags: string[]
): string {
  return `Você é um assistente de documentação técnica. Analise o conteúdo extraído do arquivo e crie um artigo estruturado para a base de conhecimento.

ARQUIVO: ${fileName} (${fileType})
CATEGORIAS DISPONÍVEIS:
${categories.join(', ')}

TAGS EXISTENTES:
${existingTags.join(', ')}

CONTEÚDO EXTRAÍDO:
${extractedText.slice(0, 15000)}

Retorne APENAS JSON válido (sem markdown, sem code fences) com:
{
  "title": "Título descritivo",
  "summary": "Resumo de 2-3 frases",
  "category": "Categoria adequada",
  "categoryConfidence": 0.0-1.0,
  "tags": ["tags"],
  "difficulty": "basic|intermediate|advanced",
  "targetAudience": "end_user|technician|admin",
  "structuredContent": "Conteúdo reorganizado em Markdown",
  "detectedSections": [
    { "title": "Nome da seção", "content": "Conteúdo resumido" }
  ],
  "shouldSplitIntoMultiple": true/false,
  "suggestedSplits": [
    { "title": "Artigo 1", "summary": "...", "contentRange": { "start": 0, "end": 100 } }
  ]
}

REGRAS:
- Se o documento tem mais de 3000 palavras e cobre tópicos distintos, sugira dividir (shouldSplitIntoMultiple: true)
- Mantenha a informação técnica intacta (códigos, comandos, queries)
- Reorganize para clareza mas não invente informação
- Detecte se é um manual, tutorial, FAQ, troubleshooting guide etc`;
}

function buildChatExtractionPrompt(
  messages: Array<{ role: string; content: string }>,
  ticketCategory?: string,
  ticketId?: string,
  categories?: string[],
  existingTags?: string[]
): string {
  const formattedMessages = messages
    .map((m) => `[${m.role.toUpperCase()}]: ${m.content}`)
    .join('\n');

  return `Você é um assistente de documentação técnica. Analise a conversa de suporte abaixo e extraia um artigo de KB documentando o problema e a solução.

CATEGORIAS DISPONÍVEIS:
${(categories ?? []).join(', ')}

TAGS EXISTENTES:
${(existingTags ?? []).join(', ')}

CONVERSA:
${formattedMessages}

CONTEXTO DO TICKET:
Categoria: ${ticketCategory ?? 'N/A'}
ID: ${ticketId ?? 'N/A'}

Retorne APENAS JSON válido (sem markdown, sem code fences) com:
{
  "title": "Título descritivo do problema resolvido",
  "summary": "Resumo breve do problema + solução",
  "category": "Categoria adequada",
  "categoryConfidence": 0.0-1.0,
  "tags": ["tags relevantes"],
  "difficulty": "basic|intermediate|advanced",
  "targetAudience": "end_user|technician|admin",
  "extractedProblem": "O que o cliente/usuário relatou como problema",
  "extractedSolution": "Como foi resolvido (resumo)",
  "extractedSteps": ["Passo 1: ...", "Passo 2: ..."],
  "structuredContent": "Artigo completo em Markdown: ## Problema\\n...\\n## Sintomas\\n...\\n## Solução\\n### Passos\\n1. ...\\n## Observações\\n...",
  "chatQuality": "high|medium|low"
}

REGRAS:
- Foque APENAS no que foi resolvido. Ignore small talk.
- Se a conversa não tem solução clara, defina chatQuality como "low"
- Os passos devem ser acionáveis e claros o suficiente para outro técnico replicar
- Não inclua nomes de clientes, dados sensíveis ou IPs no artigo
- Se houve múltiplos problemas resolvidos, foque no principal`;
}

function buildPartialSuggestionPrompt(
  title?: string,
  content?: string,
  category?: string,
  categories?: string[],
  existingTags?: string[]
): string {
  const fields: string[] = [];
  if (!title && content && content.length > 100) fields.push('"title"');
  if (!category) fields.push('"category", "categoryConfidence"');
  fields.push('"tags"', '"difficulty"', '"targetAudience"');
  if (content && content.length > 200) fields.push('"summary"');

  return `Você é um assistente de documentação técnica. Com base no conteúdo parcial abaixo, sugira os campos faltantes.

CATEGORIAS DISPONÍVEIS:
${(categories ?? []).join(', ')}

TAGS EXISTENTES:
${(existingTags ?? []).join(', ')}

TÍTULO: ${title ?? '(vazio)'}
CATEGORIA: ${category ?? '(vazio)'}
CONTEÚDO PARCIAL:
${(content ?? '').slice(0, 5000)}

Retorne APENAS JSON válido com os campos sugeridos: ${fields.join(', ')}
Retorne SOMENTE os campos que estão vazios/faltando. Não repita campos já preenchidos.`;
}

// ── Helper to parse AI JSON response ──

function parseAiJson<T>(raw: string): T {
  // Strip markdown code fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  return JSON.parse(cleaned);
}

// ── Service ──

export class KbAiAssistant {
  private modelId: string;
  private userApiKeys?: Record<string, string>;

  constructor(modelId = 'gemini-flash', userApiKeys?: Record<string, string>) {
    this.modelId = modelId;
    this.userApiKeys = userApiKeys;
  }

  private async callAi(systemPrompt: string, userMessage: string) {
    const { provider, apiModelId } = getProvider(this.modelId, this.userApiKeys);
    const start = Date.now();
    const response = await provider.chat({
      model: apiModelId,
      systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      temperature: 0.3,
      maxTokens: 4096,
      stream: false,
    });
    const latencyMs = Date.now() - start;
    return { response, latencyMs };
  }

  async analyzeQuickAdd(input: {
    text: string;
    categories: KbCategoryOption[];
    existingTags: string[];
  }): Promise<{ suggestion: QuickAddSuggestion; aiModel: string; latencyMs: number; tokensUsed: number }> {
    const categoryNames = input.categories.map((c) => c.name);
    const prompt = buildQuickAddPrompt(input.text, categoryNames, input.existingTags);
    const { response, latencyMs } = await this.callAi(
      'Você é um assistente de documentação técnica que retorna apenas JSON.',
      prompt
    );

    const suggestion = parseAiJson<QuickAddSuggestion>(response.content);
    suggestion.relatedArticles = suggestion.relatedArticles ?? [];
    suggestion.detectedErrorCodes = suggestion.detectedErrorCodes ?? [];
    suggestion.detectedSoftware = suggestion.detectedSoftware ?? [];

    return {
      suggestion,
      aiModel: this.modelId,
      latencyMs,
      tokensUsed: (response.usage?.inputTokens ?? 0) + (response.usage?.outputTokens ?? 0),
    };
  }

  async analyzeFileContent(input: {
    extractedText: string;
    fileName: string;
    fileType: string;
    categories: KbCategoryOption[];
    existingTags: string[];
  }): Promise<{ suggestion: FileUploadSuggestion; aiModel: string; latencyMs: number; tokensUsed: number }> {
    const categoryNames = input.categories.map((c) => c.name);
    const prompt = buildFileAnalysisPrompt(
      input.extractedText,
      input.fileName,
      input.fileType,
      categoryNames,
      input.existingTags
    );
    const { response, latencyMs } = await this.callAi(
      'Você é um assistente de documentação técnica que retorna apenas JSON.',
      prompt
    );

    const suggestion = parseAiJson<FileUploadSuggestion>(response.content);
    suggestion.relatedArticles = suggestion.relatedArticles ?? [];
    suggestion.detectedSections = suggestion.detectedSections ?? [];
    suggestion.shouldSplitIntoMultiple = suggestion.shouldSplitIntoMultiple ?? false;

    return {
      suggestion,
      aiModel: this.modelId,
      latencyMs,
      tokensUsed: (response.usage?.inputTokens ?? 0) + (response.usage?.outputTokens ?? 0),
    };
  }

  async analyzeChatSession(input: {
    messages: Array<{ role: string; content: string }>;
    ticketId?: string;
    ticketCategory?: string;
    categories: KbCategoryOption[];
    existingTags: string[];
  }): Promise<{ suggestion: ChatSuggestion; aiModel: string; latencyMs: number; tokensUsed: number }> {
    const categoryNames = input.categories.map((c) => c.name);
    const prompt = buildChatExtractionPrompt(
      input.messages,
      input.ticketCategory,
      input.ticketId,
      categoryNames,
      input.existingTags
    );
    const { response, latencyMs } = await this.callAi(
      'Você é um assistente de documentação técnica que retorna apenas JSON.',
      prompt
    );

    const suggestion = parseAiJson<ChatSuggestion>(response.content);
    suggestion.relatedArticles = suggestion.relatedArticles ?? [];
    suggestion.extractedSteps = suggestion.extractedSteps ?? [];
    suggestion.chatQuality = suggestion.chatQuality ?? 'medium';

    return {
      suggestion,
      aiModel: this.modelId,
      latencyMs,
      tokensUsed: (response.usage?.inputTokens ?? 0) + (response.usage?.outputTokens ?? 0),
    };
  }

  async suggestFromPartialContent(input: {
    title?: string;
    content?: string;
    category?: string;
    categories: KbCategoryOption[];
    existingTags: string[];
  }): Promise<{ suggestion: Partial<AiSuggestion>; aiModel: string; latencyMs: number; tokensUsed: number }> {
    const categoryNames = input.categories.map((c) => c.name);
    const prompt = buildPartialSuggestionPrompt(
      input.title,
      input.content,
      input.category,
      categoryNames,
      input.existingTags
    );
    const { response, latencyMs } = await this.callAi(
      'Você é um assistente de documentação técnica que retorna apenas JSON.',
      prompt
    );

    const suggestion = parseAiJson<Partial<AiSuggestion>>(response.content);

    return {
      suggestion,
      aiModel: this.modelId,
      latencyMs,
      tokensUsed: (response.usage?.inputTokens ?? 0) + (response.usage?.outputTokens ?? 0),
    };
  }

  async checkDuplicate(input: {
    title: string;
    content: string;
    userId: string;
  }): Promise<{
    isDuplicate: boolean;
    similarity: number;
    existingArticle?: { id: string; title: string; status: string; createdAt: string };
    suggestion: 'create_new' | 'update_existing' | 'merge';
  }> {
    // Use Prisma full-text search to find similar articles
    const { prisma } = await import('@/lib/prisma');

    // Search by title words
    const titleWords = input.title
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .slice(0, 5);

    if (titleWords.length === 0) {
      return { isDuplicate: false, similarity: 0, suggestion: 'create_new' };
    }

    const articles = await prisma.kbArticle.findMany({
      where: {
        userId: input.userId,
        OR: titleWords.map((word) => ({
          title: { contains: word, mode: 'insensitive' as const },
        })),
      },
      select: { id: true, title: true, status: true, createdAt: true },
      take: 5,
    });

    if (articles.length === 0) {
      return { isDuplicate: false, similarity: 0, suggestion: 'create_new' };
    }

    // Simple word-overlap similarity
    const inputWords = new Set(input.title.toLowerCase().split(/\s+/));
    let bestMatch = { similarity: 0, article: articles[0] };

    for (const article of articles) {
      const articleWords = new Set(article.title.toLowerCase().split(/\s+/));
      const intersection = [...inputWords].filter((w) => articleWords.has(w));
      const similarity = intersection.length / Math.max(inputWords.size, articleWords.size);
      if (similarity > bestMatch.similarity) {
        bestMatch = { similarity, article };
      }
    }

    const isDuplicate = bestMatch.similarity > 0.6;

    return {
      isDuplicate,
      similarity: bestMatch.similarity,
      existingArticle: isDuplicate
        ? {
            id: bestMatch.article.id,
            title: bestMatch.article.title,
            status: bestMatch.article.status,
            createdAt: bestMatch.article.createdAt.toISOString(),
          }
        : undefined,
      suggestion: bestMatch.similarity > 0.8
        ? 'update_existing'
        : bestMatch.similarity > 0.6
          ? 'merge'
          : 'create_new',
    };
  }
}
