import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { recordSignupConsents } from '@/lib/services/consent.service';
import { logDataAccess } from '@/lib/services/data-access-log.service';
import { sendVerificationEmail } from '@/lib/auth-email';

const CURRENT_POLICY_VERSION = '2026.1';

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName, password } = await req.json();

    if (!email || !firstName || !password) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Campos obrigatorios: email, firstName, password' } },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Senha deve ter no minimo 8 caracteres' } },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (exists) {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'Email ja cadastrado' } },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const userAgent = req.headers.get('user-agent') ?? undefined;

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    // Create user + credentials + default agent in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // 1. Create user (Layer 1 — Identity)
      const newUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          firstName,
          lastName: lastName || undefined,
          displayName: lastName ? `${firstName} ${lastName}` : firstName,
          status: 'PENDING_VERIFICATION',
          emailVerificationTokenHash: verificationTokenHash,
          // Layer 2 — Authentication (separate table)
          credentials: {
            create: {
              passwordHash,
              hashAlgorithm: 'BCRYPT',
            },
          },
          // Default agent
          agents: {
            create: {
              name: 'Suporte Geral',
              systemPrompt:
                'Voce e um assistente de suporte tecnico de TI. Responda de forma clara e tecnica em portugues brasileiro.',
              model: 'gemini-flash',
              isDefault: true,
            },
          },
          // Layer 4 — Default global preferences
          preferences: {
            create: {
              // tenant_id = null => global preference
            },
          },
        },
      });

      return newUser;
    });

    // Record mandatory LGPD consents (Layer 5 — Compliance)
    await recordSignupConsents(user.id, CURRENT_POLICY_VERSION, {
      ipAddress,
      userAgent,
    });

    // Log the data creation event
    await logDataAccess({
      accessorId: user.id,
      accessorType: 'user',
      subjectId: user.id,
      action: 'modify',
      dataCategories: ['email', 'name'],
      justification: 'Cadastro de novo usuario',
      ipAddress,
      userAgent,
    });

    // Send verification email (fire-and-forget)
    sendVerificationEmail({ email: normalizedEmail, token: verificationToken, firstName })
      .catch((err) => console.error('[register] Failed to send verification email:', err));

    if (process.env.NODE_ENV === 'development') {
      console.log(`[register] Verification token for ${normalizedEmail}: ${verificationToken}`);
    }

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
