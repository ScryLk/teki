import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { checkDocumentLimit } from '@/lib/plan-limits';
import { prisma } from '@/lib/prisma';
import { uploadFile } from '@/lib/storage';
import { processDocument } from '@/lib/kb/process-document';
import { withRequestLog } from '@/lib/request-logger';

export const runtime = 'nodejs';

const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'text/markdown': 'md',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

const MAX_SIZE = 10 * 1024 * 1024;

async function _GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const agentId = req.nextUrl.searchParams.get('agentId');

    const where: Record<string, string> = { userId: user.id };
    if (agentId) where.agentId = agentId;

    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(documents);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}

async function _POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const agentId = formData.get('agentId') as string | null;

    if (!file || !agentId) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'file e agentId obrigatórios.' } },
        { status: 400 }
      );
    }

    // Verify agent belongs to user
    const agent = await prisma.agent.findFirst({
      where: { id: agentId, userId: user.id },
    });
    if (!agent) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Agente não encontrado.' } },
        { status: 404 }
      );
    }

    // Check document limit
    const limit = await checkDocumentLimit(user.id, agentId, user.planId);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: {
            code: 'PLAN_LIMIT_REACHED',
            message: `Limite de ${limit.limit} documento(s) por agente atingido.`,
          },
        },
        { status: 403 }
      );
    }

    const fileType = ALLOWED_TYPES[file.type];
    if (!fileType) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Tipo de arquivo não suportado.' } },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Arquivo excede o limite de 10MB.' } },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    // Upload to storage
    const fileUrl = await uploadFile(user.id, filename, fileBuffer, file.type);

    // Create document record
    const document = await prisma.document.create({
      data: {
        agentId,
        userId: user.id,
        filename,
        originalName: file.name,
        fileType,
        fileSize: file.size,
        fileUrl,
        status: 'UPLOADING',
      },
    });

    // Process in background (extract → chunk → embed)
    processDocument(document.id, fileBuffer).catch((err) =>
      console.error('[documents] Background processing error:', err)
    );

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    console.error('[documents POST]', error);
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}

export const GET = withRequestLog(_GET);
export const POST = withRequestLog(_POST);
