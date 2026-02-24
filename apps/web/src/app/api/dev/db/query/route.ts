import { NextRequest, NextResponse } from 'next/server';
import { devOnlyGuard } from '@/lib/dev-only';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const guard = devOnlyGuard();
  if (guard) return guard;

  const body = await req.json();
  const sql = body.sql as string;

  if (!sql) {
    return NextResponse.json(
      { error: 'SQL query is required' },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.$queryRawUnsafe(sql);
    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Query error',
      },
      { status: 500 }
    );
  }
}
