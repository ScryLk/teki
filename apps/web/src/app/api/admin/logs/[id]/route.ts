import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requirePlatformOwner,
  handleAdminError,
} from '@/lib/logging/require-platform-owner';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePlatformOwner(req);

    const { id } = await params;

    const log = await prisma.platformLog.findUnique({
      where: { id },
    });

    if (!log) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Log não encontrado' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: log });
  } catch (error) {
    return handleAdminError(error);
  }
}
