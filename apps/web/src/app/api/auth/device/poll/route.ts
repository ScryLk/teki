import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Simple in-memory rate limiter for polling (1 req/3s per deviceCode)
const lastPollTime = new Map<string, number>();

export async function GET(req: NextRequest) {
  const deviceCode = req.nextUrl.searchParams.get('deviceCode');

  if (!deviceCode) {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'deviceCode obrigatorio' } },
      { status: 400 },
    );
  }

  // Rate limit check
  const now = Date.now();
  const lastPoll = lastPollTime.get(deviceCode);
  if (lastPoll && now - lastPoll < 2500) {
    return NextResponse.json(
      { error: { code: 'SLOW_DOWN', message: 'Polling muito rapido. Aguarde 3 segundos.' } },
      { status: 429 },
    );
  }
  lastPollTime.set(deviceCode, now);

  // Clean old entries periodically
  if (lastPollTime.size > 1000) {
    const cutoff = now - 600_000;
    for (const [key, time] of lastPollTime) {
      if (time < cutoff) lastPollTime.delete(key);
    }
  }

  try {
    const record = await prisma.deviceCode.findUnique({
      where: { deviceCode },
      include: {
        user: {
          include: {
            apiKeys: {
              where: { isRevoked: false },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!record) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Codigo nao encontrado' } },
        { status: 404 },
      );
    }

    // Check expiration
    if (record.expiresAt < new Date() && record.status === 'PENDING') {
      await prisma.deviceCode.update({
        where: { id: record.id },
        data: { status: 'EXPIRED' },
      });
      return NextResponse.json({ status: 'expired' });
    }

    switch (record.status) {
      case 'PENDING':
        return NextResponse.json({ status: 'pending' });

      case 'AUTHORIZED': {
        // Fetch the API key that was created during authorization
        if (record.apiKeyId) {
          const apiKey = await prisma.apiKey.findUnique({
            where: { id: record.apiKeyId },
            select: { keyPrefix: true },
          });
          // The actual key was stored temporarily in the device code record
          // Return the key prefix — the desktop already got the full key from authorize
        }
        return NextResponse.json({
          status: 'authorized',
          // API key is returned via the authorize endpoint, not polling
          // Desktop should have received it already
          email: record.user?.email,
          name: record.user?.displayName || record.user?.firstName,
        });
      }

      case 'EXPIRED':
        return NextResponse.json({ status: 'expired' });

      case 'DENIED':
        return NextResponse.json({ status: 'denied' });

      default:
        return NextResponse.json({ status: 'pending' });
    }
  } catch (error) {
    console.error('[Device] Poll error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
