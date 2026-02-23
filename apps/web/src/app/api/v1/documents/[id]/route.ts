import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { deleteFile } from '@/lib/storage';
import { processDocument } from '@/lib/kb/process-document';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;

    const document = await prisma.document.findFirst({
      where: { id, userId: user.id },
    });

    if (!document) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Documento não encontrado.' } }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;

    const document = await prisma.document.findFirst({
      where: { id, userId: user.id },
    });

    if (!document) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Documento não encontrado.' } }, { status: 404 });
    }

    // Delete file from storage
    await deleteFile(user.id, document.filename).catch(() => {});

    // Delete document (cascades to chunks)
    await prisma.document.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}

// POST /api/v1/documents/[id] — Re-index document
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;

    const document = await prisma.document.findFirst({
      where: { id, userId: user.id },
    });

    if (!document) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Documento não encontrado.' } }, { status: 404 });
    }

    // Fetch file from storage URL to re-process
    const fileResponse = await fetch(document.fileUrl);
    if (!fileResponse.ok) {
      return NextResponse.json(
        { error: { code: 'FILE_NOT_FOUND', message: 'Arquivo não encontrado no storage.' } },
        { status: 404 }
      );
    }

    const fileBuffer = Buffer.from(await fileResponse.arrayBuffer());

    // Update status and re-process
    await prisma.document.update({
      where: { id },
      data: { status: 'UPLOADING', errorMsg: null },
    });

    processDocument(id, fileBuffer).catch((err) =>
      console.error('[documents reindex] Error:', err)
    );

    return NextResponse.json({ id, status: 'reindexing' });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
