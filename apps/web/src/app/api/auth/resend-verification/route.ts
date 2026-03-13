import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/auth-email';

/**
 * POST /api/auth/resend-verification
 * Resends email verification token.
 * Always returns 200 to prevent email enumeration.
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Email e obrigatorio' } },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const successResponse = NextResponse.json({
      message: 'Se o email estiver cadastrado, voce recebera um novo link de verificacao.',
    });

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, firstName: true, status: true },
    });

    if (!user || user.status !== 'PENDING_VERIFICATION') {
      return successResponse;
    }

    // Generate a new verification token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationTokenHash: tokenHash },
    });

    // Send verification email (fire-and-forget)
    sendVerificationEmail({ email: normalizedEmail, token, firstName: user.firstName })
      .catch((err) => console.error('[resend-verification] Failed to send email:', err));

    if (process.env.NODE_ENV === 'development') {
      console.log(`[resend-verification] Token for ${normalizedEmail}: ${token}`);
    }

    return successResponse;
  } catch (error) {
    console.error('[auth/resend-verification]', error);
    return NextResponse.json({
      message: 'Se o email estiver cadastrado, voce recebera um novo link de verificacao.',
    });
  }
}
