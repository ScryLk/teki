import { prisma } from '../prisma';

// ═══════════════════════════════════════════════════════════════
// ConversationSearchService — Full-text search and analytics
// Covers: message search, conversation search, cost analytics,
// feedback analytics by provider/model
// ═══════════════════════════════════════════════════════════════

// ── Full-text Search in Messages ──

export interface MessageSearchResult {
  id: string;
  conversationId: string;
  conversationTitle: string | null;
  conversationType: string;
  content: string | null;
  senderType: string;
  createdAt: Date;
  rank: number;
}

export async function searchMessages(
  tenantId: string,
  query: string,
  options?: { limit?: number; offset?: number }
): Promise<MessageSearchResult[]> {
  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  const results = await prisma.$queryRaw<MessageSearchResult[]>`
    SELECT
      m.id,
      m.conversation_id AS "conversationId",
      c.title AS "conversationTitle",
      c.type AS "conversationType",
      m.content,
      m.sender_type AS "senderType",
      m.created_at AS "createdAt",
      ts_rank(
        to_tsvector('portuguese', COALESCE(m.content, '')),
        plainto_tsquery('portuguese', ${query})
      ) AS rank
    FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE m.tenant_id = ${tenantId}::uuid
      AND m.status != 'DELETED'
      AND to_tsvector('portuguese', COALESCE(m.content, ''))
        @@ plainto_tsquery('portuguese', ${query})
    ORDER BY rank DESC, m.created_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  return results;
}

// ── Search Conversations (title + summary) ──

export interface ConversationSearchResult {
  id: string;
  type: string;
  title: string | null;
  aiSummary: string | null;
  status: string;
  messageCount: number;
  lastMessageAt: Date | null;
  createdAt: Date;
  rank: number;
}

export async function searchConversations(
  tenantId: string,
  query: string,
  options?: { limit?: number; offset?: number }
): Promise<ConversationSearchResult[]> {
  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  const results = await prisma.$queryRaw<ConversationSearchResult[]>`
    SELECT
      c.id,
      c.type,
      c.title,
      c.ai_summary AS "aiSummary",
      c.status,
      c.message_count AS "messageCount",
      c.last_message_at AS "lastMessageAt",
      c.created_at AS "createdAt",
      ts_rank(
        to_tsvector('portuguese', COALESCE(c.title, '') || ' ' || COALESCE(c.ai_summary, '')),
        plainto_tsquery('portuguese', ${query})
      ) AS rank
    FROM conversations c
    WHERE c.tenant_id = ${tenantId}::uuid
      AND c.status != 'DELETED'
      AND to_tsvector('portuguese', COALESCE(c.title, '') || ' ' || COALESCE(c.ai_summary, ''))
        @@ plainto_tsquery('portuguese', ${query})
    ORDER BY rank DESC, c.last_message_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  return results;
}

// ── Analytics: Top Conversations by AI Cost ──

export interface CostAnalyticsResult {
  id: string;
  title: string | null;
  type: string;
  totalAiCostUsd: number;
  totalTokens: number;
  totalAiMessages: number;
  messageCount: number;
  createdAt: Date;
}

export async function getTopConversationsByCost(
  tenantId: string,
  options?: { limit?: number; periodDays?: number }
): Promise<CostAnalyticsResult[]> {
  const limit = options?.limit ?? 10;
  const periodDays = options?.periodDays ?? 30;
  const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

  const results = await prisma.conversation.findMany({
    where: {
      tenantId,
      createdAt: { gte: since },
    },
    orderBy: { totalAiCostUsd: 'desc' },
    take: limit,
    select: {
      id: true,
      title: true,
      type: true,
      totalAiCostUsd: true,
      totalAiTokensIn: true,
      totalAiTokensOut: true,
      totalAiMessages: true,
      messageCount: true,
      createdAt: true,
    },
  });

  return results.map((r) => ({
    id: r.id,
    title: r.title,
    type: r.type,
    totalAiCostUsd: Number(r.totalAiCostUsd),
    totalTokens: r.totalAiTokensIn + r.totalAiTokensOut,
    totalAiMessages: r.totalAiMessages,
    messageCount: r.messageCount,
    createdAt: r.createdAt,
  }));
}

// ── Analytics: Feedback Rate by Provider/Model ──

export interface FeedbackAnalyticsResult {
  provider: string;
  model: string;
  totalMessages: number;
  totalFeedback: number;
  positive: number;
  negative: number;
  mixed: number;
  positiveRate: number | null;
}

export async function getFeedbackByProvider(
  tenantId: string,
  options?: { periodDays?: number }
): Promise<FeedbackAnalyticsResult[]> {
  const periodDays = options?.periodDays ?? 30;
  const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

  const results = await prisma.$queryRaw<FeedbackAnalyticsResult[]>`
    SELECT
      ai.provider,
      ai.model,
      COUNT(*)::int AS "totalMessages",
      COUNT(mf.id)::int AS "totalFeedback",
      COUNT(mf.id) FILTER (WHERE mf.rating = 'POSITIVE')::int AS positive,
      COUNT(mf.id) FILTER (WHERE mf.rating = 'NEGATIVE')::int AS negative,
      COUNT(mf.id) FILTER (WHERE mf.rating = 'MIXED')::int AS mixed,
      CASE
        WHEN COUNT(mf.id) > 0
        THEN ROUND(
          COUNT(mf.id) FILTER (WHERE mf.rating = 'POSITIVE')::decimal
          / COUNT(mf.id) * 100, 1
        )
        ELSE NULL
      END AS "positiveRate"
    FROM message_ai_metadata ai
    LEFT JOIN message_feedback mf ON mf.message_id = ai.message_id
    WHERE ai.tenant_id = ${tenantId}::uuid
      AND ai.created_at >= ${since}
    GROUP BY ai.provider, ai.model
    ORDER BY "totalMessages" DESC
  `;

  return results;
}

// ── Analytics: AI Cost Summary by Period ──

export interface CostSummary {
  totalCostUsd: number;
  totalTokensIn: number;
  totalTokensOut: number;
  totalMessages: number;
  totalConversations: number;
  avgCostPerConversation: number;
  avgCostPerMessage: number;
}

export async function getCostSummary(
  tenantId: string,
  options?: { periodDays?: number }
): Promise<CostSummary> {
  const periodDays = options?.periodDays ?? 30;
  const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

  const result = await prisma.conversation.aggregate({
    where: {
      tenantId,
      createdAt: { gte: since },
      totalAiMessages: { gt: 0 },
    },
    _sum: {
      totalAiCostUsd: true,
      totalAiTokensIn: true,
      totalAiTokensOut: true,
      totalAiMessages: true,
    },
    _count: true,
  });

  const totalCost = Number(result._sum.totalAiCostUsd ?? 0);
  const totalMessages = result._sum.totalAiMessages ?? 0;
  const totalConversations = result._count;

  return {
    totalCostUsd: totalCost,
    totalTokensIn: result._sum.totalAiTokensIn ?? 0,
    totalTokensOut: result._sum.totalAiTokensOut ?? 0,
    totalMessages,
    totalConversations,
    avgCostPerConversation: totalConversations > 0 ? totalCost / totalConversations : 0,
    avgCostPerMessage: totalMessages > 0 ? totalCost / totalMessages : 0,
  };
}

// ── Analytics: Most Cited KB Articles ──

export interface MostCitedArticle {
  referenceId: string;
  referenceTitle: string | null;
  citationCount: number;
  avgRelevanceScore: number | null;
}

export async function getMostCitedKbArticles(
  tenantId: string,
  options?: { limit?: number; periodDays?: number }
): Promise<MostCitedArticle[]> {
  const limit = options?.limit ?? 10;
  const periodDays = options?.periodDays ?? 30;
  const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

  const results = await prisma.$queryRaw<MostCitedArticle[]>`
    SELECT
      ms.reference_id AS "referenceId",
      ms.reference_title AS "referenceTitle",
      COUNT(*)::int AS "citationCount",
      ROUND(AVG(ms.relevance_score)::numeric, 4) AS "avgRelevanceScore"
    FROM message_sources ms
    WHERE ms.tenant_id = ${tenantId}::uuid
      AND ms.source_type = 'KB_ARTICLE'
      AND ms.reference_id IS NOT NULL
      AND ms.created_at >= ${since}
    GROUP BY ms.reference_id, ms.reference_title
    ORDER BY "citationCount" DESC
    LIMIT ${limit}
  `;

  return results;
}
