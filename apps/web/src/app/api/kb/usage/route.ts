import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { getKbUsageSummary } from '@/lib/kb/kb-limits';
import { getKbLimits } from '@/lib/kb/plan-config';
import { MODE_UPGRADE_BADGES } from '@/lib/kb/plan-config';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const usage = await getKbUsageSummary(user.id, user.planId);
    const limits = getKbLimits(user.planId);
    const badges = MODE_UPGRADE_BADGES[user.planId] ?? {};

    return NextResponse.json({
      plan: user.planId.toLowerCase(),
      usage,
      limits: {
        ...limits,
        allowedInsertionModes: limits.allowedInsertionModes,
      },
      modeBadges: badges,
    });
  } catch (error) {
    if ((error as Error).name === 'AuthError') {
      return NextResponse.json({ error: (error as Error).message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erro ao buscar uso' }, { status: 500 });
  }
}
