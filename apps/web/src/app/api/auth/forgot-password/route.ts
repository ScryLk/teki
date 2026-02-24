import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * POST /api/auth/forgot-password
 * Generates a password recovery token and (in production) sends it via email.
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

    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json({
      message: 'Se o email estiver cadastrado, voce recebera um link para redefinir sua senha.',
    });

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, status: true, credentials: { select: { id: true } } },
    });

    if (!user || user.status !== 'ACTIVE' || !user.credentials) {
      return successResponse;
    }

    // Generate a secure recovery token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store the hashed token using existing schema fields
    await prisma.userCredential.update({
      where: { userId: user.id },
      data: {
        recoveryTokenHash: tokenHash,
        recoveryTokenExpiresAt: expiresAt,
      },
    });

    // TODO: Send email with reset link containing the raw token
    // In development, log the token for testing
    if (process.env.NODE_ENV === 'development') {
      console.log(`[forgot-password] Recovery token for ${normalizedEmail}: ${token}`);
    }

    return successResponse;
  } catch (error) {
    console.error('[auth/forgot-password]', error);
    return NextResponse.json({
      message: 'Se o email estiver cadastrado, voce recebera um link para redefinir sua senha.',
    });
  }
}
