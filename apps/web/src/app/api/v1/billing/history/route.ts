import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    const page = parseInt(req.nextUrl.searchParams.get('page') ?? '0', 10);
    const limit = Math.min(
      parseInt(req.nextUrl.searchParams.get('limit') ?? '20', 10),
      50
    );

    const [history, total] = await Promise.all([
      prisma.planHistory.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        skip: page * limit,
        take: limit,
      }),
      prisma.planHistory.count({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({
      history,
      total,
      page,
      pageSize: limit,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: error.message } },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
