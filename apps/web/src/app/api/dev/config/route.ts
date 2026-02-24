import { NextRequest, NextResponse } from 'next/server';
import { devOnlyGuard } from '@/lib/dev-only';

let runtimeOverrides: Record<string, unknown> = {};

export async function GET() {
  const guard = devOnlyGuard();
  if (guard) return guard;

  return NextResponse.json({
    plan: runtimeOverrides.plan ?? process.env.TEKI_DEV_PLAN ?? 'pro',
    role: runtimeOverrides.role ?? process.env.TEKI_DEV_ROLE ?? 'owner',
    seed: process.env.TEKI_DEV_SEED ?? 'basic',
    devTools: process.env.TEKI_DEV_TOOLS !== 'false',
    mockLatency: runtimeOverrides.mockLatency ?? 0,
    overrides: runtimeOverrides,
  });
}

export async function PUT(req: NextRequest) {
  const guard = devOnlyGuard();
  if (guard) return guard;

  const body = await req.json();

  if (body.plan) runtimeOverrides.plan = body.plan;
  if (body.role) runtimeOverrides.role = body.role;
  if (body.mockLatency !== undefined)
    runtimeOverrides.mockLatency = body.mockLatency;
  if (body.reset) runtimeOverrides = {};

  return NextResponse.json({
    ok: true,
    overrides: runtimeOverrides,
  });
}
