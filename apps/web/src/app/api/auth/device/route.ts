import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { prisma } from '@/lib/prisma';

// Characters without ambiguity (no 0/O, 1/I/L)
const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generateUserCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return code.slice(0, 3) + '-' + code.slice(3);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userAgent = body.userAgent || req.headers.get('user-agent') || null;

    const userCode = generateUserCode();
    const deviceCode = `dc_${nanoid(24)}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.deviceCode.create({
      data: {
        userCode,
        deviceCode,
        userAgent,
        expiresAt,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://teki.com.br';

    return NextResponse.json({
      deviceCode,
      userCode,
      verificationUrl: `${appUrl}/auth/device`,
      expiresIn: 600,
    });
  } catch (error) {
    console.error('[Device] Error creating device code:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Erro ao gerar codigo' } },
      { status: 500 },
    );
  }
}
