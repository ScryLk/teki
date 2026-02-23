import { prisma } from '@/lib/prisma';
import type { KnowledgeBaseArticle, Ticket } from '@prisma/client';
import { getTenantSettings } from '@/lib/tenant';
import type { Tenant } from '@prisma/client';

interface ScoredArticle extends KnowledgeBaseArticle {
  score: number;
  matchType: string;
}

interface SimilarTicketResult {
  ticketNumber: string;
  summary: string;
  category: string;
  resolutionNotes: string | null;
  aiConfidence: string | null;
}

export class KnowledgeSearchService {
  async searchByErrorCode(
    tenantId: string,
    errorCode: string
  ): Promise<ScoredArticle[]> {
    const articles = await prisma.knowledgeBaseArticle.findMany({
      where: {
        tenantId,
        status: 'published',
        OR: [
          { problemDescription: { contains: errorCode, mode: 'insensitive' } },
          { tags: { has: errorCode } },
        ],
      },
      orderBy: [{ successRate: 'desc' }, { usageCount: 'desc' }],
      take: 3,
    });

    return articles.map((a) => ({
      ...a,
      score: 90 + Number(a.successRate) * 0.1,
      matchType: 'error_code',
    }));
  }

  async searchFullText(
    tenantId: string,
    terms: string,
    category?: string
  ): Promise<ScoredArticle[]> {
    try {
      const results = await prisma.$queryRaw<Array<KnowledgeBaseArticle & { rank: number }>>`
        SELECT *,
          ts_rank("searchVector", plainto_tsquery('portuguese', ${terms})) as rank
        FROM "KnowledgeBaseArticle"
        WHERE "tenantId" = ${tenantId}
          AND status = 'published'
          AND "searchVector" @@ plainto_tsquery('portuguese', ${terms})
        ORDER BY rank DESC
        LIMIT 5
      `;

      return results
        .filter((r) => !category || r.category === category)
        .map((r) => ({
          ...r,
          score: 50 + r.rank * 25 + Number(r.successRate) * 0.05,
          matchType: 'fulltext',
        }));
    } catch {
      // Fallback to ILIKE if full-text search is not available
      return this.searchILike(tenantId, terms, category);
    }
  }

  private async searchILike(
    tenantId: string,
    terms: string,
    category?: string
  ): Promise<ScoredArticle[]> {
    const words = terms.split(/\s+/).filter((w) => w.length > 2);
    if (words.length === 0) return [];

    const conditions = words.map((word) => ({
      OR: [
        { title: { contains: word, mode: 'insensitive' as const } },
        { problemDescription: { contains: word, mode: 'insensitive' as const } },
        { solutionSteps: { contains: word, mode: 'insensitive' as const } },
      ],
    }));

    const articles = await prisma.knowledgeBaseArticle.findMany({
      where: {
        tenantId,
        status: 'published',
        AND: conditions,
        ...(category ? { category } : {}),
      },
      orderBy: [{ usageCount: 'desc' }, { successRate: 'desc' }],
      take: 5,
    });

    return articles.map((a) => ({
      ...a,
      score: 30 + Number(a.successRate) * 0.05,
      matchType: 'ilike',
    }));
  }

  async searchCombined(
    tenant: Tenant,
    ticket: Ticket
  ): Promise<KnowledgeBaseArticle[]> {
    const settings = getTenantSettings(tenant);
    const maxArticles = (settings.ai_config as Record<string, unknown>).max_kb_articles_in_context as number ?? 5;
    const minScore = (settings.kb_config as Record<string, unknown>).min_relevance_score as number ?? 30;

    const allResults: ScoredArticle[] = [];
    const seenIds = new Set<string>();

    const ctx = ticket.contextJson as Record<string, unknown>;
    const issue = ctx.issue as Record<string, unknown> | undefined;
    const error = issue?.error as Record<string, unknown> | undefined;
    const errorCode = error?.code as string | undefined;

    // Layer 1: Error code match
    if (errorCode) {
      const errorResults = await this.searchByErrorCode(tenant.id, errorCode);
      for (const r of errorResults) {
        if (!seenIds.has(r.id)) {
          seenIds.add(r.id);
          allResults.push(r);
        }
      }
    }

    // Layer 2: Full-text search using summary + description + category
    const searchTerms = [
      ticket.summary,
      issue?.description as string ?? '',
      ticket.category,
    ]
      .filter(Boolean)
      .join(' ');

    if (searchTerms.trim()) {
      const ftResults = await this.searchFullText(tenant.id, searchTerms, ticket.category);
      for (const r of ftResults) {
        if (!seenIds.has(r.id)) {
          seenIds.add(r.id);
          allResults.push(r);
        }
      }
    }

    // Layer 3: Search using error message
    const errorMessage = error?.message as string | undefined;
    if (errorMessage && errorMessage.length > 3) {
      const errMsgResults = await this.searchFullText(tenant.id, errorMessage);
      for (const r of errMsgResults) {
        if (!seenIds.has(r.id)) {
          seenIds.add(r.id);
          allResults.push(r);
        }
      }
    }

    // Sort by score and filter
    allResults.sort((a, b) => b.score - a.score);
    return allResults.filter((r) => r.score >= minScore).slice(0, maxArticles);
  }

  async findSimilarTickets(
    tenantId: string,
    ticket: Ticket,
    maxResults = 3
  ): Promise<SimilarTicketResult[]> {
    const ctx = ticket.contextJson as Record<string, unknown>;
    const issue = ctx.issue as Record<string, unknown> | undefined;
    const error = issue?.error as Record<string, unknown> | undefined;
    const errorCode = error?.code as string | undefined;

    const where: Record<string, unknown> = {
      tenantId,
      id: { not: ticket.id },
      category: ticket.category,
      status: { in: ['resolved', 'closed'] },
      resolutionNotes: { not: null },
    };

    // If there's an error code, prioritize tickets with the same error
    if (errorCode) {
      where.OR = [
        { errorJson: { path: ['code'], equals: errorCode } },
        { summary: { contains: errorCode, mode: 'insensitive' } },
      ];
    }

    const similarTickets = await prisma.ticket.findMany({
      where,
      select: {
        ticketNumber: true,
        summary: true,
        category: true,
        resolutionNotes: true,
        aiConfidence: true,
      },
      orderBy: { resolvedAt: 'desc' },
      take: maxResults,
    });

    return similarTickets;
  }
}
