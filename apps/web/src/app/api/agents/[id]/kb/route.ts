import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { processDocument } from '@/lib/knowledge-base';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['pdf', 'txt', 'md', 'csv', 'docx', 'doc'];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const documents = await prisma.kBDocument.findMany({
      where: { agentId: id },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        uploadedAt: true,
        _count: { select: { chunks: true } },
      },
      orderBy: { uploadedAt: 'desc' },
    });

    return Response.json(documents);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno';
    console.error('GET /api/agents/[id]/kb error:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify agent exists
    const agent = await prisma.agent.findUnique({ where: { id } });
    if (!agent) {
      return Response.json({ error: 'Agente não encontrado' }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Validate file type
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_TYPES.includes(ext)) {
      return Response.json(
        { error: `Tipo de arquivo não suportado: .${ext}. Use: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: 'Arquivo muito grande. Máximo: 10MB' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await processDocument(id, file.name, buffer);

    return Response.json(result, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno';
    console.error('POST /api/agents/[id]/kb error:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params; // consume params
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return Response.json({ error: 'documentId é obrigatório' }, { status: 400 });
    }

    await prisma.kBDocument.delete({ where: { id: documentId } });
    return Response.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno';
    console.error('DELETE /api/agents/[id]/kb error:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
