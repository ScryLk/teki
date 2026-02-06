import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getUploadsDir } from '@/lib/solutions-store';

export const runtime = 'nodejs';

const MIME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Prevent directory traversal
  const safeName = path.basename(filename);
  const filePath = path.join(getUploadsDir(), safeName);

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(safeName).slice(1).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${safeName}"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Arquivo nao encontrado' },
      { status: 404 }
    );
  }
}
