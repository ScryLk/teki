import { prisma } from '@/lib/prisma';
import { generateEmbedding } from './embeddings';

interface SearchResult {
  chunkId: string;
  documentId: string;
  content: string;
  similarity: number;
  filename: string;
}

export async function searchKnowledgeBase(
  agentId: string,
  query: string,
  topK = 5,
  minSimilarity = 0.7
): Promise<SearchResult[]> {
  const queryEmbedding = await generateEmbedding(query);
  const embeddingStr = `[${queryEmbedding.join(',')}]`;

  const results = await prisma.$queryRaw<SearchResult[]>`
    SELECT
      dc.id as "chunkId",
      dc."documentId",
      dc.content,
      1 - (dc.embedding <=> ${embeddingStr}::vector) as similarity,
      d.filename
    FROM "DocumentChunk" dc
    JOIN "Document" d ON d.id = dc."documentId"
    WHERE d."agentId" = ${agentId}
      AND d.status = 'INDEXED'
      AND dc.embedding IS NOT NULL
      AND 1 - (dc.embedding <=> ${embeddingStr}::vector) > ${minSimilarity}
    ORDER BY dc.embedding <=> ${embeddingStr}::vector
    LIMIT ${topK}
  `;

  return results;
}

export function formatKBContext(results: SearchResult[]): string {
  if (results.length === 0) return '';

  const header = '--- BASE DE CONHECIMENTO ---';
  const chunks = results
    .map(
      (r, i) =>
        `[Fonte ${i + 1}: ${r.filename} (relevância: ${(r.similarity * 100).toFixed(0)}%)]\n${r.content}`
    )
    .join('\n\n');
  const footer = '--- FIM DA BASE DE CONHECIMENTO ---';

  return `${header}\n\n${chunks}\n\n${footer}`;
}
