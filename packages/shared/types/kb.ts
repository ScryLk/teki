// ─── Knowledge Base Types ─────────────────────────────────────────────────────

export type KBDocStatus = 'processing' | 'indexed' | 'error';
export type KBDocType = 'pdf' | 'md' | 'txt' | 'docx';

export interface KBDocument {
  id: string;
  name: string;
  type: KBDocType;
  sizeBytes: number;
  status: KBDocStatus;
  errorMessage?: string;
  chunksCount: number;
  wordsCount: number;
  createdAt: string;
  indexedAt?: string;
}

export interface KBSearchResult {
  docId: string;
  docName: string;
  chunkIndex: number;
  content: string;
  similarity: number;
}

export interface KBUploadPayload {
  name: string;
  buffer: ArrayBuffer;
}

export interface KBStats {
  totalDocs: number;
  totalChunks: number;
  totalSizeBytes: number;
  embeddingsLoaded: boolean;
}

export interface KBChunk {
  chunkIndex: number;
  content: string;
  wordCount: number;
}

export interface KBDocStatusEvent {
  docId: string;
  status: KBDocStatus;
  errorMessage?: string;
  chunksCount?: number;
  wordsCount?: number;
}
