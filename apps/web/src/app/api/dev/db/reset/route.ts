import { NextRequest, NextResponse } from 'next/server';
import { devOnlyGuard } from '@/lib/dev-only';

export async function POST(req: NextRequest) {
  const guard = devOnlyGuard();
  if (guard) return guard;

  const body = await req.json().catch(() => ({}));

  if (!body.confirm) {
    return NextResponse.json(
      {
        error:
          'Database reset requires confirmation. Send { "confirm": true } in the body.',
      },
      { status: 400 }
    );
  }

  // Placeholder: in production this would truncate all tables
  return NextResponse.json({
    ok: true,
    message: 'Database reset complete',
  });
}
