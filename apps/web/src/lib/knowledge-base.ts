import { prisma } from './db';
import { chunkText } from './chunking';
import { extractText } from './text-extraction';

export async function processDocument(
  agentId: string,
  fileName: string,
  buffer: Buffer
): Promise<{ id: string; fileName: string; chunks: number }> {
  const fileType = getFileType(fileName);
  let content: string;

  if (fileType === 'pdf' || fileType === 'docx' || fileType === 'doc') {
    content = await extractText(buffer, fileType);
  } else {
    content = buffer.toString('utf-8');
  }

  const chunks = chunkText(content, { maxChunkSize: 1000, overlapSize: 200 });

  const doc = await prisma.kBDocument.create({
    data: {
      agentId,
      fileName,
      fileType,
      fileSize: buffer.length,
      content,
      chunks: {
        create: chunks.map((chunk) => ({
          content: chunk.content,
          index: chunk.index,
          tokenCount: estimateTokens(chunk.content),
        })),
      },
    },
    include: { chunks: true },
  });

  return { id: doc.id, fileName: doc.fileName, chunks: doc.chunks.length };
}

export async function searchKnowledgeBase(
  agentId: string,
  query: string,
  maxChunks: number = 10
): Promise<string> {
  const chunks = await prisma.documentChunk.findMany({
    where: {
      document: { agentId },
    },
    include: {
      document: { select: { fileName: true } },
    },
  });

  if (chunks.length === 0) return '';

  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const scored = chunks.map((chunk) => {
    const lowerContent = chunk.content.toLowerCase();
    const score = queryWords.reduce((acc, word) => {
      return acc + (lowerContent.includes(word) ? 1 : 0);
    }, 0);
    return { ...chunk, score };
  });

  const topChunks = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks)
    .filter((c) => c.score > 0);

  const selectedChunks =
    topChunks.length > 0
      ? topChunks
      : scored.slice(0, Math.min(5, scored.length));

  return selectedChunks
    .map((c) => `[Fonte: ${c.document.fileName}]\n${c.content}`)
    .join('\n\n---\n\n');
}

function getFileType(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || 'txt';
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
