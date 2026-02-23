import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, name, password } = await req.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Campos obrigatórios: email, name, password' } },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Senha deve ter no mínimo 8 caracteres' } },
        { status: 400 }
      );
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'Email já cadastrado' } },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        planId: 'FREE',
        agents: {
          create: {
            name: 'Suporte Geral',
            systemPrompt:
              'Você é um assistente de suporte técnico de TI. Responda de forma clara e técnica em português brasileiro.',
            model: 'gemini-flash',
            isDefault: true,
          },
        },
      },
    });

    return NextResponse.json(
      { id: user.id, email: user.email },
      { status: 201 }
    );
  } catch (error) {
    console.error('[register]', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Erro interno' } },
      { status: 500 }
    );
  }
}
