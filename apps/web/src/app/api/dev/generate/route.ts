import { NextRequest, NextResponse } from 'next/server';
import { devOnlyGuard } from '@/lib/dev-only';

type GenerateType =
  | 'kb_article'
  | 'ticket'
  | 'log'
  | 'user'
  | 'ai_log'
  | 'session';

export async function POST(req: NextRequest) {
  const guard = devOnlyGuard();
  if (guard) return guard;

  const body = await req.json();
  const type = body.type as GenerateType;
  const count = body.count ?? 1;
  const options = body.options ?? {};

  if (
    !type ||
    !['kb_article', 'ticket', 'log', 'user', 'ai_log', 'session'].includes(
      type
    )
  ) {
    return NextResponse.json(
      {
        error: `Invalid type. Must be one of: kb_article, ticket, log, user, ai_log, session`,
      },
      { status: 400 }
    );
  }

  // Placeholder: in production this would create real records
  return NextResponse.json({
    ok: true,
    type,
    count,
    options,
    message: `Generated ${count} ${type}(s)`,
  });
}
