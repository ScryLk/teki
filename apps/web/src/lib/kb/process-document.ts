import { prisma } from '@/lib/prisma';
import { extractText } from '@/lib/text-extraction';
import { chunkText } from '@/lib/chunking';
import { generateEmbeddingsBatch } from './embeddings';

export async function processDocument(
  documentId: string,
  fileBuffer: Buffer
): Promise<void> {
  try {
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!doc) throw new Error('Documento não encontrado.');

    // 1. Extract text
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'EXTRACTING' },
    });

    let text: string;
    if (doc.fileType === 'txt' || doc.fileType === 'md') {
      text = fileBuffer.toString('utf-8');
    } else {
      text = await extractText(fileBuffer, doc.fileType);
    }

    if (text.trim().length < 50) {
      throw new Error('Conteúdo extraído muito curto (< 50 caracteres).');
    }

    // 2. Chunking
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'EMBEDDING' },
    });

    const chunks = chunkText(text, { maxChunkSize: 2000, overlapSize: 200 });

    // 3. Generate embeddings in batch (max 50 per request)
    const batchSize = 50;
    const allEmbeddings: number[][] = [];

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const embeddings = await generateEmbeddingsBatch(
        batch.map((c) => c.content)
      );
      allEmbeddings.push(...embeddings);
    }

    // 4. Save chunks with embeddings in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.documentChunk.deleteMany({ where: { documentId } });

      for (let i = 0; i < chunks.length; i++) {
        const embeddingStr = `[${allEmbeddings[i].join(',')}]`;
        await tx.$executeRaw`
          INSERT INTO "DocumentChunk" (id, "documentId", "chunkIndex", content, embedding, "tokenCount", "createdAt")
          VALUES (
            ${`chunk_${documentId}_${i}`},
            ${documentId},
            ${i},
            ${chunks[i].content},
            ${embeddingStr}::vector,
            ${Math.ceil(chunks[i].content.length / 4)},
            NOW()
          )
        `;
      }

      await tx.document.update({
        where: { id: documentId },
        data: { status: 'INDEXED', totalChunks: chunks.length },
      });
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Erro no processamento.';
    console.error(`[KB] Error processing document ${documentId}:`, error);
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'ERROR', errorMsg: message },
    });
  }
}
