import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * POST /api/auth/verify-email
 * Verifies a user's email using a verification token.
 */
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Token e obrigatorio' } },
        { status: 400 }
      );
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user by verification token stored in metadata
    // The token is stored as a hashed value in the user's emailVerificationTokenHash field
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationTokenHash: tokenHash,
        status: 'PENDING_VERIFICATION',
      },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: { code: 'INVALID_TOKEN', message: 'Token invalido ou ja utilizado' } },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        status: 'ACTIVE',
        emailVerificationTokenHash: null,
      },
    });

    return NextResponse.json({
      message: 'Email verificado com sucesso!',
    });
  } catch (error) {
    console.error('[auth/verify-email]', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Erro interno' } },
      { status: 500 }
    );
  }
}
