import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revokeAllSessions } from '@/lib/services/session.service';

export async function PATCH(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'currentPassword e newPassword obrigatorios' } },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Nova senha deve ter no minimo 8 caracteres' } },
        { status: 400 }
      );
    }

    // Fetch credentials from separate table
    const credential = await prisma.userCredential.findUnique({
      where: { userId: user.id },
    });

    if (!credential) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Usuario nao possui autenticacao por senha' } },
        { status: 400 }
      );
    }

    const valid = await bcrypt.compare(currentPassword, credential.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: { code: 'INVALID_PASSWORD', message: 'Senha atual incorreta' } },
        { status: 403 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update credential (not user table — security isolation)
    await prisma.userCredential.update({
      where: { userId: user.id },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
        mustChangePassword: false,
        failedAttempts: 0,
        lockedUntil: null,
      },
    });

    // Revoke all other sessions for security (password changed)
    await revokeAllSessions(user.id, user.id, 'PASSWORD_CHANGED');

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
