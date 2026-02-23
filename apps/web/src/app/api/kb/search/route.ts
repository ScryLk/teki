import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { requireTenant, TenantError, getTenantSettings } from '@/lib/tenant';
import { kbSearchSchema } from '@/lib/validations/kb';

interface SearchResult {
  id: string;
  articleNumber: string;
  title: string;
  category: string;
  problemDescription: string;
  solutionSteps: string;
  tags: string[];
  usageCount: number;
  successRate: number;
  score: number;
  matchType: string;
}

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const tenant = await requireTenant(user);
    const settings = getTenantSettings(tenant);

    const { searchParams } = new URL(req.url);
    const params = kbSearchSchema.parse({
      query: searchParams.get('query') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      errorCode: searchParams.get('errorCode') ?? undefined,
      softwareVersion: searchParams.get('softwareVersion') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    });

    const results: SearchResult[] = [];
    const seenIds = new Set<string>();

    // Layer 1: Exact error code match (highest priority)
    if (params.errorCode) {
      const errorMatches = await prisma.knowledgeBaseArticle.findMany({
        where: {
          tenantId: tenant.id,
          status: 'published',
          OR: [
            { problemDescription: { contains: params.errorCode, mode: 'insensitive' } },
            { tags: { has: params.errorCode } },
          ],
        },
        orderBy: [{ successRate: 'desc' }, { usageCount: 'desc' }],
        take: 3,
      });

      for (const article of errorMatches) {
        if (!seenIds.has(article.id)) {
          seenIds.add(article.id);
          results.push({
            id: article.id,
            articleNumber: article.articleNumber,
            title: article.title,
            category: article.category,
            problemDescription: article.problemDescription,
            solutionSteps: article.solutionSteps,
            tags: article.tags,
            usageCount: article.usageCount,
            successRate: Number(article.successRate),
            score: 90 + Number(article.successRate) * 0.1,
            matchType: 'error_code',
          });
        }
      }
    }

    // Layer 2: Full-text search using tsvector
    if (params.query) {
      try {
        const fullTextResults = await prisma.$queryRaw<Array<{
          id: string;
          articleNumber: string;
          title: string;
          category: string;
          problemDescription: string;
          solutionSteps: string;
          tags: string[];
          usageCount: number;
          successRate: number;
          rank: number;
        }>>`
          SELECT
            id,
            "articleNumber",
            title,
            category,
            "problemDescription",
            "solutionSteps",
            tags,
            "usageCount",
            "successRate"::float as "successRate",
            ts_rank("searchVector", plainto_tsquery('portuguese', ${params.query})) as rank
          FROM "KnowledgeBaseArticle"
          WHERE "tenantId" = ${tenant.id}
            AND status = 'published'
            AND "searchVector" @@ plainto_tsquery('portuguese', ${params.query})
            ${params.category ? prisma.$queryRaw`AND category = ${params.category}` : prisma.$queryRaw``}
          ORDER BY rank DESC
          LIMIT 5
        `;

        for (const row of fullTextResults) {
          if (!seenIds.has(row.id)) {
            seenIds.add(row.id);
            results.push({
              id: row.id,
              articleNumber: row.articleNumber,
              title: row.title,
              category: row.category,
              problemDescription: row.problemDescription,
              solutionSteps: row.solutionSteps,
              tags: row.tags,
              usageCount: row.usageCount,
              successRate: row.successRate,
              score: 50 + row.rank * 25 + row.successRate * 0.05,
              matchType: 'fulltext',
            });
          }
        }
      } catch {
        // Full-text search may fail if searchVector isn't populated yet
        // Fall through to ILIKE fallback
      }
    }

    // Layer 3: ILIKE fallback
    if (params.query && results.length < params.limit) {
      const terms = params.query.split(/\s+/).filter(t => t.length > 2);
      if (terms.length > 0) {
        const ilikeConditions = terms.map(term => ({
          OR: [
            { title: { contains: term, mode: 'insensitive' as const } },
            { problemDescription: { contains: term, mode: 'insensitive' as const } },
            { solutionSteps: { contains: term, mode: 'insensitive' as const } },
          ],
        }));

        const ilikeResults = await prisma.knowledgeBaseArticle.findMany({
          where: {
            tenantId: tenant.id,
            status: 'published',
            AND: ilikeConditions,
            ...(params.category ? { category: params.category } : {}),
          },
          orderBy: [{ usageCount: 'desc' }, { successRate: 'desc' }],
          take: params.limit,
        });

        for (const article of ilikeResults) {
          if (!seenIds.has(article.id)) {
            seenIds.add(article.id);
            results.push({
              id: article.id,
              articleNumber: article.articleNumber,
              title: article.title,
              category: article.category,
              problemDescription: article.problemDescription,
              solutionSteps: article.solutionSteps,
              tags: article.tags,
              usageCount: article.usageCount,
              successRate: Number(article.successRate),
              score: 30 + Number(article.successRate) * 0.05,
              matchType: 'ilike',
            });
          }
        }
      }
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    // Filter by min relevance score
    const minScore = (settings.kb_config as Record<string, unknown>).min_relevance_score as number ?? 30;
    const filtered = results.filter(r => r.score >= minScore).slice(0, params.limit);

    return NextResponse.json(filtered);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof TenantError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('GET /api/kb/search error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
