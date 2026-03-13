import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    // Fetch full user profile with memberships
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        avatarUrl: true,
        emailVerified: true,
        status: true,
        createdAt: true,
        memberships: {
          where: { status: 'ACTIVE' },
          select: {
            tenantId: true,
            role: true,
            jobTitle: true,
            department: true,
            tenant: {
              select: {
                id: true,
                name: true,
                slug: true,
                plan: true,
              },
            },
          },
        },
      },
    });

    if (!fullUser) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Usuario nao encontrado' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: fullUser.id,
      email: fullUser.email,
      firstName: fullUser.firstName,
      lastName: fullUser.lastName,
      displayName: fullUser.displayName,
      avatarUrl: fullUser.avatarUrl,
      emailVerified: fullUser.emailVerified,
      status: fullUser.status,
      createdAt: fullUser.createdAt,
      tenants: fullUser.memberships.map((m) => ({
        tenantId: m.tenantId,
        name: m.tenant.name,
        slug: m.tenant.slug,
        plan: m.tenant.plan,
        role: m.role,
        jobTitle: m.jobTitle,
        department: m.department,
      })),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    // Anonymize user data instead of hard delete (LGPD compliance)
    const anonymized = `deleted_${user.id.slice(0, 8)}`;
    await prisma.$transaction([
      // Remove sessions
      prisma.nextAuthSession.deleteMany({ where: { userId: user.id } }),
      // Remove device codes
      prisma.deviceCode.deleteMany({ where: { userId: user.id } }),
      // Remove credentials
      prisma.userCredential.deleteMany({ where: { userId: user.id } }),
      // Remove auth providers
      prisma.userAuthProvider.deleteMany({ where: { userId: user.id } }),
      // Remove NextAuth accounts
      prisma.nextAuthAccount.deleteMany({ where: { userId: user.id } }),
      // Remove API keys
      prisma.apiKey.deleteMany({ where: { userId: user.id } }),
      // Remove provider keys
      prisma.providerKey.deleteMany({ where: { userId: user.id } }),
      // Anonymize user record
      prisma.user.update({
        where: { id: user.id },
        data: {
          email: `${anonymized}@deleted.teki.com.br`,
          firstName: 'Conta',
          lastName: 'Excluída',
          displayName: 'Conta Excluída',
          name: 'Conta Excluída',
          phone: null,
          avatarUrl: null,
          status: 'DEACTIVATED',
          deactivatedAt: new Date(),
          deactivatedReason: 'Exclusão solicitada pelo usuário',
          anonymizedAt: new Date(),
          anonymizedBy: user.id,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    console.error('[DELETE /api/v1/user]', error);
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const { firstName, lastName, avatarUrl } = await req.json();

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        // Recompute displayName
        ...((firstName !== undefined || lastName !== undefined) && {
          displayName:
            (firstName ?? user.firstName) +
            (lastName !== undefined
              ? lastName
                ? ` ${lastName}`
                : ''
              : user.lastName
                ? ` ${user.lastName}`
                : ''),
        }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
