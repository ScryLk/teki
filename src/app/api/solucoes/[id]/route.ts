import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { readSolution, deleteSolutionRecord, getUploadsDir } from '@/lib/solutions-store';
import { getAdminClient, SOLUCOES_INDEX } from '@/lib/algolia-admin';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const solution = await readSolution(id);

  if (!solution) {
    return NextResponse.json({ error: 'Solucao nao encontrada' }, { status: 404 });
  }

  return NextResponse.json(solution);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const solution = await deleteSolutionRecord(id);

    if (!solution) {
      return NextResponse.json({ error: 'Solucao nao encontrada' }, { status: 404 });
    }

    // Delete Algolia records
    if (solution.totalChunks > 0) {
      const objectIDs = Array.from({ length: solution.totalChunks }, (_, i) =>
        `${id}_chunk_${i}`
      );
      try {
        await getAdminClient().deleteObjects({
          indexName: SOLUCOES_INDEX,
          objectIDs,
        });
      } catch (err) {
        console.error('Error deleting from Algolia:', err);
      }
    }

    // Delete file from disk
    try {
      const filePath = path.join(
        getUploadsDir(),
        `${id}.${solution.fileType}`
      );
      await fs.unlink(filePath);
    } catch {
      // File may not exist
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('DELETE /api/solucoes/[id] error:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir solucao' },
      { status: 500 }
    );
  }
}
