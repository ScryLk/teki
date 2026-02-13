import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import {
  ensureUploadsDir,
  getUploadsDir,
  readAllSolutions,
  writeSolution,
} from '@/lib/solutions-store';
import { processSolution } from '@/lib/process-solution';
import type { SolutionRecord, Category, Criticality } from '@/lib/types';

export const runtime = 'nodejs';

const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function getFileType(mimeType: string): string {
  switch (mimeType) {
    case 'application/pdf':
      return 'pdf';
    case 'application/msword':
      return 'doc';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'docx';
    default:
      return 'unknown';
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get('file') as File | null;
    const titulo = formData.get('titulo') as string | null;
    const descricao = formData.get('descricao') as string | null;
    const categoria = formData.get('categoria') as Category | null;
    const tagsRaw = formData.get('tags') as string | null;
    const sistemasRaw = formData.get('sistemasRelacionados') as string | null;
    const criticidade = (formData.get('criticidade') as Criticality | null) ?? 'media';

    // Validate required fields
    if (!file || !titulo || !descricao || !categoria) {
      return NextResponse.json(
        { error: 'Campos obrigatorios: titulo, descricao, categoria, arquivo' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo nao permitido. Use PDF, DOC ou DOCX.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Arquivo excede o limite de 10MB.' },
        { status: 400 }
      );
    }

    const tags = tagsRaw ? JSON.parse(tagsRaw) : [];
    const sistemasRelacionados = sistemasRaw ? JSON.parse(sistemasRaw) : [];

    const id = `sol_${uuidv4().replace(/-/g, '').slice(0, 8)}`;
    const fileType = getFileType(file.type);
    const fileName = `${id}.${fileType}`;

    // Save file to disk
    await ensureUploadsDir();
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(getUploadsDir(), fileName);
    await fs.writeFile(filePath, fileBuffer);

    // Create solution record
    const solution: SolutionRecord = {
      id,
      titulo,
      descricao,
      categoria,
      tags,
      sistemasRelacionados,
      criticidade,
      author: 'Tecnico',
      createdAt: new Date().toISOString(),
      fileUrl: `/api/uploads/${fileName}`,
      fileType,
      fileName: file.name,
      status: 'uploading',
      totalChunks: 0,
    };

    await writeSolution(solution);

    // Fire-and-forget processing
    processSolution(solution, fileBuffer).catch((err) =>
      console.error('Background processing error:', err)
    );

    return NextResponse.json({ id, status: 'uploading' }, { status: 201 });
  } catch (error) {
    console.error('POST /api/solucoes error:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar solucao' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const solutions = await readAllSolutions();
    // Sort by createdAt descending
    solutions.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json(solutions);
  } catch (error) {
    console.error('GET /api/solucoes error:', error);
    return NextResponse.json(
      { error: 'Erro ao listar solucoes' },
      { status: 500 }
    );
  }
}
