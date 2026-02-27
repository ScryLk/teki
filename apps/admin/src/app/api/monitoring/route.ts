import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const [
    activeSessionCount,
    messagesLastHour,
    conversationsLastHour,
    connectorHealthList,
    aiProviderStatus,
    recentErrors,
  ] = await Promise.all([
    prisma.userSession.count({
      where: { isActive: true, lastActivityAt: { gte: fiveMinutesAgo } },
    }),
    prisma.message.count({ where: { createdAt: { gte: oneHourAgo } } }),
    prisma.conversation.count({ where: { createdAt: { gte: oneHourAgo } } }),
    prisma.externalConnector.findMany({
      where: { status: { in: ['ACTIVE', 'ERROR', 'PAUSED'] } },
      select: {
        id: true,
        displayName: true,
        platform: true,
        status: true,
        healthStatus: true,
        healthCheckAt: true,
        avgResponseTimeMs: true,
        lastSyncAt: true,
        lastSyncStatus: true,
        consecutiveErrors: true,
        tenant: { select: { name: true } },
      },
      orderBy: { healthCheckAt: 'desc' },
      take: 20,
    }),
    prisma.aiProviderConfig.findMany({
      where: { isActive: true },
      select: {
        id: true,
        provider: true,
        displayName: true,
        apiKeyValid: true,
        apiKeyLastValidatedAt: true,
        currentMonthRequests: true,
        currentMonthCostUsd: true,
        dailyRequestLimit: true,
        rateLimitRpm: true,
        tenant: { select: { name: true } },
      },
      orderBy: { currentMonthRequests: 'desc' },
      take: 20,
    }),
    prisma.connectorSyncLog.findMany({
      where: { status: 'SYNC_ERROR' },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        errorMessage: true,
        createdAt: true,
        connector: {
          select: { displayName: true, platform: true },
        },
      },
    }),
  ]);

  return NextResponse.json({
    realtime: {
      activeUsers: activeSessionCount,
      messagesLastHour,
      conversationsLastHour,
    },
    connectors: connectorHealthList.map((c) => ({
      ...c,
      tenantName: c.tenant.name,
      healthCheckAt: c.healthCheckAt?.toISOString() ?? null,
      lastSyncAt: c.lastSyncAt?.toISOString() ?? null,
    })),
    aiProviders: aiProviderStatus.map((p) => ({
      ...p,
      tenantName: p.tenant.name,
      currentMonthCostUsd: Number(p.currentMonthCostUsd),
      apiKeyLastValidatedAt: p.apiKeyLastValidatedAt?.toISOString() ?? null,
    })),
    recentErrors: recentErrors.map((e) => ({
      ...e,
      startedAt: e.createdAt.toISOString(),
      connectorName: e.connector.displayName,
      platform: e.connector.platform,
    })),
  });
  } catch (error) {
    console.error('[monitoring]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
