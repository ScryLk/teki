import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { revokeAllSessions } from '@/lib/services/session.service';

/**
 * POST /api/auth/reset-password
 * Resets password using a valid recovery token.
 */
export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Token e nova senha sao obrigatorios' } },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Senha deve ter no minimo 8 caracteres' } },
        { status: 400 }
      );
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find credential by hashed recovery token
    const credential = await prisma.userCredential.findFirst({
      where: {
        recoveryTokenHash: tokenHash,
        recoveryTokenExpiresAt: { gt: new Date() },
      },
      select: { userId: true },
    });

    if (!credential) {
      return NextResponse.json(
        { error: { code: 'INVALID_TOKEN', message: 'Token invalido ou expirado' } },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Update password and clear recovery token
    await prisma.userCredential.update({
      where: { userId: credential.userId },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
        failedAttempts: 0,
        lockedUntil: null,
        recoveryTokenHash: null,
        recoveryTokenExpiresAt: null,
      },
    });

    // Revoke all sessions for security
    await revokeAllSessions(credential.userId, credential.userId, 'PASSWORD_CHANGED');

    return NextResponse.json({
      message: 'Senha alterada com sucesso. Faca login novamente.',
    });
  } catch (error) {
    console.error('[auth/reset-password]', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Erro interno' } },
      { status: 500 }
    );
  }
}
