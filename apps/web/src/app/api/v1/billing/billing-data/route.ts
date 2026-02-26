import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { validateTaxId } from '@/lib/tax-id';
import { maskTaxId } from '@/lib/tax-id';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        billingName: true,
        billingCompany: true,
        billingTaxId: true,
        email: true,
      },
    });

    return NextResponse.json({
      billingName: dbUser?.billingName ?? null,
      billingCompany: dbUser?.billingCompany ?? null,
      billingTaxId: dbUser?.billingTaxId
        ? maskTaxId(dbUser.billingTaxId)
        : null,
      email: dbUser?.email ?? null,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: error.message } },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const body = await req.json();

    const data: Record<string, string | null> = {};

    if (typeof body.billingName === 'string') {
      const name = body.billingName.trim();
      if (!name) {
        return NextResponse.json(
          { error: { code: 'BAD_REQUEST', message: 'Nome nao pode ser vazio.' } },
          { status: 400 }
        );
      }
      data.billingName = name;
    }

    if (typeof body.billingCompany === 'string') {
      data.billingCompany = body.billingCompany.trim() || null;
    }

    if (typeof body.billingTaxId === 'string') {
      const raw = body.billingTaxId.trim();
      if (raw) {
        const result = validateTaxId(raw);
        if (!result) {
          return NextResponse.json(
            { error: { code: 'BAD_REQUEST', message: 'CPF ou CNPJ invalido.' } },
            { status: 400 }
          );
        }
        data.billingTaxId = result.clean;
      } else {
        data.billingTaxId = null;
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Nenhum campo para atualizar.' } },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: error.message } },
        { status: 401 }
      );
    }
    console.error('[billing-data patch]', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
