import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const days = parseInt(params.get('days') || '30');
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [
    aiUsageDaily,
    feedbackSummary,
    topProviders,
    conversationsByType,
    messagesByDay,
  ] = await Promise.all([
    prisma.aiUsageDaily.findMany({
      where: { usageDate: { gte: since } },
      orderBy: { usageDate: 'asc' },
      select: {
        usageDate: true,
        provider: true,
        model: true,
        requestCount: true,
        tokensInput: true,
        tokensOutput: true,
        costUsd: true,
        avgLatencyMs: true,
        errorCount: true,
        feedbackPositive: true,
        feedbackNegative: true,
      },
    }),
    prisma.messageFeedback.groupBy({
      by: ['rating'],
      _count: { id: true },
      where: { createdAt: { gte: since } },
    }),
    prisma.aiUsageDaily.groupBy({
      by: ['provider'],
      _sum: { costUsd: true, requestCount: true, tokensInput: true, tokensOutput: true },
      where: { usageDate: { gte: since } },
      orderBy: { _sum: { costUsd: 'desc' } },
    }),
    prisma.conversation.groupBy({
      by: ['type'],
      _count: { id: true },
      where: { createdAt: { gte: since } },
    }),
    prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM messages
      WHERE created_at >= ${since}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `,
  ]);

  // Aggregate daily AI costs
  const costByDay = new Map<string, number>();
  for (const row of aiUsageDaily) {
    const key = row.usageDate.toISOString().split('T')[0];
    costByDay.set(key, (costByDay.get(key) || 0) + Number(row.costUsd));
  }

  // Confidence distribution from message metadata
  let confidenceDistribution: { classification: string; count: number }[] = [];
  let avgConfidence = 0;
  try {
    const messagesWithConfidence = await prisma.$queryRaw<
      { metadata: string }[]
    >`
      SELECT metadata::text
      FROM conversation_messages
      WHERE role = 'ASSISTANT'
        AND metadata IS NOT NULL
        AND metadata::text LIKE '%confidence%'
        AND created_at >= ${since}
      LIMIT 5000
    `;

    const distMap: Record<string, number> = { BASE_LOCAL: 0, INFERIDO: 0, GENERICO: 0 };
    let totalPct = 0;
    let count = 0;

    for (const row of messagesWithConfidence) {
      try {
        const meta = typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata;
        const conf = meta?.confidence;
        if (conf?.classification) {
          distMap[conf.classification] = (distMap[conf.classification] ?? 0) + 1;
          totalPct += conf.percentage ?? 0;
          count++;
        }
      } catch { /* skip malformed */ }
    }

    confidenceDistribution = Object.entries(distMap).map(([classification, cnt]) => ({
      classification,
      count: cnt,
    }));
    avgConfidence = count > 0 ? Math.round(totalPct / count) : 0;
  } catch { /* confidence query optional */ }

  return NextResponse.json({
    aiUsage: aiUsageDaily.map((r) => ({
      ...r,
      usageDate: r.usageDate.toISOString().split('T')[0],
      costUsd: Number(r.costUsd),
    })),
    feedbackSummary: feedbackSummary.map((f) => ({
      rating: f.rating,
      count: f._count.id,
    })),
    topProviders: topProviders.map((p) => ({
      provider: p.provider,
      totalCost: Number(p._sum.costUsd || 0),
      totalRequests: p._sum.requestCount || 0,
      totalTokensIn: p._sum.tokensInput || 0,
      totalTokensOut: p._sum.tokensOutput || 0,
    })),
    conversationsByType: conversationsByType.map((c) => ({
      type: c.type,
      count: c._count.id,
    })),
    messagesByDay: messagesByDay.map((r) => ({
      date: String(r.date),
      count: Number(r.count),
    })),
    costByDay: Array.from(costByDay.entries()).map(([date, cost]) => ({
      date,
      cost,
    })),
    confidenceDistribution,
    avgConfidence,
  });
}
