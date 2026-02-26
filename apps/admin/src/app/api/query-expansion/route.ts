import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const days = parseInt(params.get('days') || '30');
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Query conversation messages that have expansion metadata
  const messagesWithExpansion = await prisma.$queryRaw<
    {
      metadata: string;
      created_at: Date;
    }[]
  >`
    SELECT metadata::text, created_at
    FROM conversation_messages
    WHERE role = 'ASSISTANT'
      AND metadata IS NOT NULL
      AND metadata::text LIKE '%kb_expansion%'
      AND created_at >= ${since}
    ORDER BY created_at DESC
    LIMIT 5000
  `;

  // Aggregate layer resolution stats
  const layerCounts = { l0: 0, l1: 0, l2: 0, l3: 0, miss: 0 };
  let totalTokens = 0;
  let totalLatency = 0;
  let totalExpansions = 0;
  let scoreImprovementSum = 0;
  let scoreImprovementCount = 0;

  // Daily breakdown for chart
  const dailyMap = new Map<string, { l0: number; l1: number; l2: number; l3: number; miss: number }>();

  for (const row of messagesWithExpansion) {
    try {
      const meta = typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata;
      const expansion = meta?.kb_expansion;
      if (!expansion) continue;

      totalExpansions++;
      totalTokens += expansion.expansionTokens ?? 0;
      totalLatency += expansion.expansionLatencyMs ?? 0;

      const layer = expansion.resolvedAtLayer;
      if (layer === 0) layerCounts.l0++;
      else if (layer === 1) layerCounts.l1++;
      else if (layer === 2) layerCounts.l2++;
      else if (layer === 3) layerCounts.l3++;
      else layerCounts.miss++;

      if (expansion.improvement?.scoreDelta) {
        scoreImprovementSum += expansion.improvement.scoreDelta;
        scoreImprovementCount++;
      }

      // Daily aggregation
      const dateKey = row.created_at.toISOString().split('T')[0];
      const daily = dailyMap.get(dateKey) ?? { l0: 0, l1: 0, l2: 0, l3: 0, miss: 0 };
      if (layer === 0) daily.l0++;
      else if (layer === 1) daily.l1++;
      else if (layer === 2) daily.l2++;
      else if (layer === 3) daily.l3++;
      else daily.miss++;
      dailyMap.set(dateKey, daily);
    } catch {
      // Skip malformed metadata
    }
  }

  const avgScoreImprovement =
    scoreImprovementCount > 0 ? scoreImprovementSum / scoreImprovementCount : 0;
  const avgTokensPerExpansion =
    totalExpansions > 0 ? totalTokens / totalExpansions : 0;
  const avgLatencyPerExpansion =
    totalExpansions > 0 ? totalLatency / totalExpansions : 0;
  const noMatchRate =
    totalExpansions > 0 ? layerCounts.miss / totalExpansions : 0;

  // Build daily chart data sorted by date
  const dailyData = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({ date, ...counts }));

  return NextResponse.json({
    layerCounts,
    totalExpansions,
    avgScoreImprovement: Math.round(avgScoreImprovement * 1000) / 1000,
    avgTokensPerExpansion: Math.round(avgTokensPerExpansion),
    avgLatencyPerExpansion: Math.round(avgLatencyPerExpansion),
    noMatchRate: Math.round(noMatchRate * 1000) / 1000,
    totalTokensSpent: totalTokens,
    dailyData,
  });
}
