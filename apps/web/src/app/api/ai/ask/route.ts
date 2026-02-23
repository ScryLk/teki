import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { requireTenant, TenantError, getTenantSettings } from '@/lib/tenant';
import { AiPromptBuilder } from '@/lib/ai/services/prompt-builder';
import { AiResponseParser } from '@/lib/ai/services/response-parser';
import { KnowledgeSearchService } from '@/lib/ai/services/knowledge-search';
import { z } from 'zod';

const askSchema = z.object({
  ticketId: z.string().min(1),
  query: z.string().min(1),
});

const ANTHROPIC_BASE = 'https://api.anthropic.com/v1';
const ANTHROPIC_VERSION = '2023-06-01';

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const { user } = await requireAuth(req);
    const tenant = await requireTenant(user);
    const settings = getTenantSettings(tenant);
    const aiConfig = settings.ai_config as Record<string, unknown>;

    const body = await req.json();
    const { ticketId, query } = askSchema.parse(body);

    // Load ticket
    const ticket = await prisma.ticket.findFirst({
      where: { id: ticketId, tenantId: tenant.id },
    });
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket não encontrado.' }, { status: 404 });
    }

    // Pipeline
    const promptBuilder = new AiPromptBuilder();
    const responseParser = new AiResponseParser();
    const knowledgeSearch = new KnowledgeSearchService();

    // Step 1: Search KB for relevant articles
    const kbArticles = await knowledgeSearch.searchCombined(tenant, ticket);

    // Step 2: Find similar resolved tickets
    const maxSimilar = (aiConfig.max_similar_tickets_in_context as number) ?? 3;
    const similarTickets = await knowledgeSearch.findSimilarTickets(
      tenant.id,
      ticket,
      maxSimilar
    );

    // Step 3: Get already attempted solutions from history
    const ctx = ticket.contextJson as Record<string, unknown>;
    const history = ctx.history as Record<string, unknown> | undefined;
    const attemptedSolutions = (history?.solutions_already_attempted as string[]) ?? [];

    // Step 4: Build prompt
    const { system, user: userPrompt } = promptBuilder.buildFullPrompt(
      tenant,
      ticket,
      query,
      kbArticles,
      similarTickets,
      attemptedSolutions
    );

    // Step 5: Call Anthropic API
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Chave da API Anthropic não configurada.' }, { status: 500 });
    }

    const model = (aiConfig.model as string) ?? 'claude-sonnet-4-5-20250929';
    const maxTokens = (aiConfig.max_tokens as number) ?? 2000;
    const temperature = (aiConfig.temperature as number) ?? 0.3;

    const aiResponse = await fetchWithRetry(async () => {
      const res = await fetch(`${ANTHROPIC_BASE}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': ANTHROPIC_VERSION,
        },
        body: JSON.stringify({
          model,
          system,
          messages: [{ role: 'user', content: userPrompt }],
          max_tokens: maxTokens,
          temperature,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Anthropic error ${res.status}: ${err}`);
      }

      return res.json();
    });

    const latencyMs = Date.now() - startTime;
    const rawContent = aiResponse.content?.[0]?.text ?? '';

    // Step 6: Parse response
    const parsed = responseParser.parse(rawContent);

    // Step 7: Save to ticket
    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        aiResponseJson: JSON.parse(JSON.stringify(parsed)),
        aiConfidence: parsed.confidence,
        aiSource: parsed.source,
      },
    });

    // Step 8: Save AI message to ticket timeline
    await prisma.ticketMessage.create({
      data: {
        ticketId,
        senderType: 'ai',
        content: parsed.diagnosis?.summary ?? rawContent.slice(0, 500),
        aiResponseRaw: JSON.parse(JSON.stringify(parsed)),
      },
    });

    // Step 9: Log usage
    await prisma.aiUsageLog.create({
      data: {
        tenantId: tenant.id,
        ticketId,
        modelUsed: aiResponse.model ?? model,
        promptTokens: aiResponse.usage?.input_tokens ?? null,
        completionTokens: aiResponse.usage?.output_tokens ?? null,
        totalTokens: (aiResponse.usage?.input_tokens ?? 0) + (aiResponse.usage?.output_tokens ?? 0),
        latencyMs,
        confidence: parsed.confidence,
        source: parsed.source,
        kbArticlesUsed: kbArticles.map((a) => a.articleNumber),
      },
    });

    return NextResponse.json({
      response: parsed,
      metadata: {
        model: aiResponse.model ?? model,
        latencyMs,
        kbArticlesUsed: kbArticles.length,
        similarTicketsFound: similarTickets.length,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof TenantError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
    }
    console.error('POST /api/ai/ask error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao consultar IA' },
      { status: 500 }
    );
  }
}

async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Only retry on rate limit (429) or server errors (5xx)
      if (lastError.message.includes('429') || lastError.message.includes('5')) {
        if (i < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, baseDelay * Math.pow(2, i)));
          continue;
        }
      }
      throw lastError;
    }
  }

  throw lastError;
}
