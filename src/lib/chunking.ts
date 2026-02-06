export interface Chunk {
  content: string;
  index: number;
}

export function chunkText(
  text: string,
  options?: {
    maxChunkSize?: number;
    overlapSize?: number;
  }
): Chunk[] {
  const maxSize = options?.maxChunkSize ?? 3000;
  const overlap = options?.overlapSize ?? 400;

  const cleaned = text.replace(/\r\n/g, '\n').trim();
  if (!cleaned) return [];

  const paragraphs = cleaned.split(/\n\n+/);
  const chunks: Chunk[] = [];
  let currentChunk = '';
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    // If single paragraph exceeds max size, split by sentences
    if (trimmed.length > maxSize) {
      // Flush current chunk first
      if (currentChunk) {
        chunks.push({ content: currentChunk.trim(), index: chunkIndex++ });
        currentChunk = getOverlap(currentChunk, overlap);
      }

      const sentences = splitBySentences(trimmed);
      let sentenceChunk = currentChunk;

      for (const sentence of sentences) {
        if (sentenceChunk.length + sentence.length > maxSize && sentenceChunk) {
          chunks.push({ content: sentenceChunk.trim(), index: chunkIndex++ });
          sentenceChunk = getOverlap(sentenceChunk, overlap);
        }
        sentenceChunk += (sentenceChunk ? ' ' : '') + sentence;
      }
      currentChunk = sentenceChunk;
      continue;
    }

    // Would adding this paragraph exceed the limit?
    const wouldBe = currentChunk
      ? currentChunk + '\n\n' + trimmed
      : trimmed;

    if (wouldBe.length > maxSize && currentChunk) {
      chunks.push({ content: currentChunk.trim(), index: chunkIndex++ });
      currentChunk = getOverlap(currentChunk, overlap) + '\n\n' + trimmed;
    } else {
      currentChunk = wouldBe;
    }
  }

  // Flush remaining
  if (currentChunk.trim()) {
    chunks.push({ content: currentChunk.trim(), index: chunkIndex });
  }

  return chunks;
}

function getOverlap(text: string, size: number): string {
  if (text.length <= size) return text;
  return text.slice(-size);
}

function splitBySentences(text: string): string[] {
  // Split on sentence-ending punctuation followed by space
  const parts = text.split(/(?<=[.!?])\s+/);
  return parts.filter(Boolean);
}
