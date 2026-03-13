import { EventEmitter } from 'events';
import { getKBStore } from './kb-store';
import settingsStore from './settings-store';
import type { KBDocument, KBSearchResult, KBUploadPayload, KBDocStatusEvent } from '@teki/shared';

const CHUNK_SIZE = 500;     // target words per chunk
const CHUNK_OVERLAP = 50;   // overlap words between chunks
const EMBEDDING_MODEL = 'text-embedding-004';
const GEMINI_EMBED_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export class KBService extends EventEmitter {

  // ── Text Extraction ─────────────────────────────────────────────────────

  private async extractText(name: string, buffer: Buffer): Promise<string> {
    const ext = name.split('.').pop()?.toLowerCase();

    switch (ext) {
      case 'pdf': {
        const pdfParse = require('pdf-parse');
        const result = await pdfParse(buffer);
        return result.text;
      }
      case 'docx': {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
      }
      case 'md':
      case 'txt':
      default:
        return buffer.toString('utf-8');
    }
  }

  // ── Chunking ────────────────────────────────────────────────────────────

  private chunkText(text: string): string[] {
    const words = text.split(/\s+/).filter((w) => w.length > 0);
    if (words.length <= CHUNK_SIZE) return [words.join(' ')];

    const chunks: string[] = [];
    let i = 0;
    while (i < words.length) {
      const chunk = words.slice(i, i + CHUNK_SIZE).join(' ');
      if (chunk.trim()) chunks.push(chunk);
      i += CHUNK_SIZE - CHUNK_OVERLAP;
    }
    return chunks;
  }

  // ── Embedding ───────────────────────────────────────────────────────────

  private async embedText(text: string): Promise<Float32Array | null> {
    const apiKey = settingsStore.get('geminiApiKey');
    if (!apiKey) return null;

    const res = await fetch(
      `${GEMINI_EMBED_URL}/${EMBEDDING_MODEL}:embedContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: `models/${EMBEDDING_MODEL}`,
          content: { parts: [{ text }] },
        }),
      },
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[KBService] Embedding API error ${res.status}:`, errText);
      throw new Error(`Embedding API error: ${res.status}`);
    }

    const data = await res.json();
    return new Float32Array(data.embedding.values);
  }

  private async embedBatch(chunks: string[]): Promise<(Float32Array | null)[]> {
    const results: (Float32Array | null)[] = [];
    for (const chunk of chunks) {
      try {
        results.push(await this.embedText(chunk));
      } catch (err) {
        console.error('[KBService] Embedding failed for chunk, skipping:', err);
        results.push(null);
      }
    }
    return results;
  }

  // ── Ingest Pipeline ─────────────────────────────────────────────────────

  async ingestDocument(payload: KBUploadPayload): Promise<KBDocument> {
    const store = getKBStore();
    const id = `kb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const buffer = Buffer.from(payload.buffer);
    const ext = payload.name.split('.').pop()?.toLowerCase() ?? 'txt';

    // 1. Insert doc record
    store.insertDoc({ id, name: payload.name, type: ext, sizeBytes: buffer.length });
    this.emitStatus({ docId: id, status: 'processing' });

    try {
      // 2. Extract text
      console.log(`[KBService] Extracting text from ${payload.name}...`);
      const text = await this.extractText(payload.name, buffer);
      const totalWords = text.split(/\s+/).filter((w) => w.length > 0).length;

      // 3. Chunk
      const chunks = this.chunkText(text);
      console.log(`[KBService] ${payload.name}: ${totalWords} words, ${chunks.length} chunks`);

      // 4. Generate embeddings
      const embeddings = await this.embedBatch(chunks);
      const embeddedCount = embeddings.filter((e) => e !== null).length;
      console.log(`[KBService] Generated ${embeddedCount}/${chunks.length} embeddings`);

      // 5. Store chunks
      for (let i = 0; i < chunks.length; i++) {
        const embBuf = embeddings[i]
          ? Buffer.from(embeddings[i]!.buffer, embeddings[i]!.byteOffset, embeddings[i]!.byteLength)
          : null;
        const wordCount = chunks[i].split(/\s+/).length;
        store.insertChunk(id, i, chunks[i], wordCount, embBuf);
      }

      // 6. Update doc status
      store.updateDocStatus(id, 'indexed', { chunksCount: chunks.length, wordsCount: totalWords });

      // 7. Reload embeddings cache
      store.loadAllEmbeddings();

      const doc = store.getDoc(id)!;
      this.emitStatus({ docId: id, status: 'indexed', chunksCount: chunks.length, wordsCount: totalWords });
      return doc;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[KBService] Ingest failed for ${payload.name}:`, msg);
      store.updateDocStatus(id, 'error', { errorMessage: msg });
      this.emitStatus({ docId: id, status: 'error', errorMessage: msg });
      return store.getDoc(id)!;
    }
  }

  // ── Search ──────────────────────────────────────────────────────────────

  async search(query: string, topK = 5): Promise<KBSearchResult[]> {
    const store = getKBStore();

    // Try vector search first
    try {
      const queryEmbedding = await this.embedText(query);
      if (queryEmbedding) {
        return store.searchSimilar(queryEmbedding, topK);
      }
    } catch {
      // Fall through to keyword search
    }

    // Fallback: keyword search
    return store.keywordSearch(query, topK);
  }

  async buildContext(query: string): Promise<string | null> {
    const store = getKBStore();
    if (store.getEmbeddingsCacheSize() === 0 && store.getStats().totalChunks === 0) {
      return null;
    }

    const results = await this.search(query, 5);
    if (results.length === 0) return null;

    return [
      '=== Contexto da Base de Conhecimento ===',
      ...results.map(
        (r, i) => `[${i + 1}] (${r.docName}, trecho ${r.chunkIndex + 1})\n${r.content}`,
      ),
      '=== Fim do Contexto ===',
    ].join('\n\n');
  }

  // ── Events ──────────────────────────────────────────────────────────────

  private emitStatus(event: KBDocStatusEvent): void {
    this.emit('doc-status', event);
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

let instance: KBService | null = null;

export function getKBService(): KBService {
  if (!instance) instance = new KBService();
  return instance;
}
