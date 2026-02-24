import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { getPlanLimits } from '@/lib/plan-limits';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const limits = getPlanLimits(user.planId);

    // Get tenant billing details
    const membership = await prisma.tenantMember.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
      include: {
        tenant: {
          select: {
            planExpiresAt: true,
            mpPreapprovalId: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      planId: user.planId,
      planExpiresAt: membership?.tenant.planExpiresAt ?? null,
      mpPreapprovalId: membership?.tenant.mpPreapprovalId ?? null,
      limits,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
