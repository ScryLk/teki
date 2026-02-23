import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { createSubscription } from '@/lib/mercadopago';

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const { planId } = await req.json();

    if (planId !== 'starter' && planId !== 'pro') {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'planId deve ser "starter" ou "pro".' } },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://teki.com.br';

    const result = await createSubscription({
      userEmail: user.email,
      planId,
      backUrl: `${appUrl}/dashboard/billing?status=success`,
    });

    return NextResponse.json({
      checkoutUrl: result.initPoint,
      preapprovalId: result.preapprovalId,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    console.error('[billing subscribe]', error);
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
