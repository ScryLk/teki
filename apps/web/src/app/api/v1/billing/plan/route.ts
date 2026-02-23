import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { getPlanLimits } from '@/lib/plan-limits';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const limits = getPlanLimits(user.planId);

    return NextResponse.json({
      planId: user.planId,
      planExpiresAt: user.planExpiresAt,
      mpPreapprovalId: user.mpPreapprovalId,
      limits,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
