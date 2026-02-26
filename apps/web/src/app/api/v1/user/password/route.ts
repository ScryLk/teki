import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// POST — Define password for the first time
export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const { password } = await req.json();

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Senha deve ter no minimo 8 caracteres' } },
        { status: 400 },
      );
    }

    const existing = await prisma.userCredential.findUnique({
      where: { userId: user.id },
    });

    if (existing) {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'Voce ja tem uma senha definida. Use PATCH para alterar.' } },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.userCredential.create({
      data: {
        userId: user.id,
        passwordHash,
        hashAlgorithm: 'BCRYPT',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: error.message } },
        { status: 401 },
      );
    }
    console.error('[Password] POST error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}

// PATCH — Change existing password
export async function PATCH(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'currentPassword e newPassword obrigatorios' } },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Nova senha deve ter no minimo 8 caracteres' } },
        { status: 400 },
      );
    }

    const credential = await prisma.userCredential.findUnique({
      where: { userId: user.id },
    });

    if (!credential) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Usuario nao possui autenticacao por senha' } },
        { status: 400 },
      );
    }

    const valid = await bcrypt.compare(currentPassword, credential.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: { code: 'INVALID_PASSWORD', message: 'Senha atual incorreta' } },
        { status: 403 },
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

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

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: error.message } },
        { status: 401 },
      );
    }
    console.error('[Password] PATCH error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}

// DELETE — Remove password (revert to Google/Magic Link only)
export async function DELETE(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    // Ensure user has at least one other auth method
    const authProviders = await prisma.userAuthProvider.count({
      where: { userId: user.id, revokedAt: null },
    });

    const nextAuthAccounts = await (prisma as any).nextAuthAccount.count({
      where: { userId: user.id },
    });

    if (authProviders === 0 && nextAuthAccounts === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'BAD_REQUEST',
            message: 'Nao e possivel remover a senha sem outro metodo de login vinculado.',
          },
        },
        { status: 400 },
      );
    }

    const credential = await prisma.userCredential.findUnique({
      where: { userId: user.id },
    });

    if (!credential) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Nenhuma senha definida' } },
        { status: 404 },
      );
    }

    await prisma.userCredential.delete({
      where: { userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: error.message } },
        { status: 401 },
      );
    }
    console.error('[Password] DELETE error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
