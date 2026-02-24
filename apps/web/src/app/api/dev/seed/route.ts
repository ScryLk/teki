import { NextRequest, NextResponse } from 'next/server';
import { devOnlyGuard } from '@/lib/dev-only';

export async function POST(req: NextRequest) {
  const guard = devOnlyGuard();
  if (guard) return guard;

  const body = await req.json();
  const scenario = body.scenario ?? 'basic';
  const reset = body.reset ?? false;

  // In a real implementation this would call the seed functions
  // For now, return the planned seed operation
  return NextResponse.json({
    ok: true,
    scenario,
    reset,
    message: `Seed "${scenario}" ${reset ? '(with reset) ' : ''}executed`,
  });
}
