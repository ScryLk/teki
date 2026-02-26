import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const body = await req.json();
    const { aiTone, area, name, skip } = body;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { onboardingStep: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Usuario nao encontrado' } },
        { status: 404 },
      );
    }

    const currentStep = dbUser.onboardingStep;
    const updateData: Record<string, unknown> = {};

    // Step 0 → 1: AI tone preference
    if (currentStep === 0) {
      if (!skip && aiTone) {
        const validTones = ['tecnico_direto', 'didatico', 'formal'];
        if (!validTones.includes(aiTone)) {
          return NextResponse.json(
            { error: { code: 'BAD_REQUEST', message: 'aiTone invalido' } },
            { status: 400 },
          );
        }
        updateData.aiTone = aiTone;
      }
      updateData.onboardingStep = 1;
    }

    // Step 1 → 2: Area
    else if (currentStep === 1) {
      if (!skip && area) {
        const validAreas = [
          'infra',
          'dev',
          'suporte',
          'redes',
          'banco_dados',
          'outro',
        ];
        if (!validAreas.includes(area)) {
          return NextResponse.json(
            { error: { code: 'BAD_REQUEST', message: 'area invalida' } },
            { status: 400 },
          );
        }
        updateData.area = area;
      }
      updateData.onboardingStep = 2;
    }

    // Step 2 → 3: Name (if missing)
    else if (currentStep === 2) {
      if (!skip && name) {
        const nameParts = name.trim().split(' ');
        updateData.firstName = nameParts[0];
        updateData.lastName =
          nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;
        updateData.displayName = name.trim();
        updateData.name = name.trim();
      }
      updateData.onboardingStep = 3;
    }

    // Already complete
    else {
      return NextResponse.json({
        onboardingStep: currentStep,
        message: 'Onboarding ja completo',
      });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        onboardingStep: true,
        aiTone: true,
        area: true,
        firstName: true,
        displayName: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: error.message } },
        { status: 401 },
      );
    }
    console.error('[Onboarding] Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
