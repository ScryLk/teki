import { NextResponse } from 'next/server';
import { devOnlyGuard } from '@/lib/dev-only';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const guard = devOnlyGuard();
  if (guard) return guard;

  try {
    const [
      users,
      agents,
      documents,
      conversations,
      channels,
      apiKeys,
      providerKeys,
      usageCounters,
      webhookEndpoints,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.agent.count(),
      prisma.document.count(),
      prisma.conversation.count(),
      prisma.channel.count(),
      prisma.apiKey.count(),
      prisma.providerKey.count(),
      prisma.usageCounter.count(),
      prisma.webhookEndpoint.count(),
    ]);

    return NextResponse.json({
      ok: true,
      tables: {
        users,
        agents,
        documents,
        conversations,
        channels,
        apiKeys,
        providerKeys,
        usageCounters,
        webhookEndpoints,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Database error',
      },
      { status: 500 }
    );
  }
}
