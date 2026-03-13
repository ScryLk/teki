import Database from 'better-sqlite3';
import { app } from 'electron';
import { join } from 'path';
import type { KBDocument, KBSearchResult } from '@teki/shared';

export class KBStore {
  private db: Database.Database;
  private embeddingsCache = new Map<number, Float32Array>();
  private chunkMeta = new Map<number, { docId: string; docName: string; chunkIndex: number; content: string }>();

  constructor(dbPath?: string) {
    const path = dbPath || join(app.getPath('userData'), 'kb.db');
    this.db = new Database(path);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('foreign_keys = ON');
    this.migrate();
  }

  private migrate(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS kb_documents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        size_bytes INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'processing',
        error_message TEXT,
        chunks_count INTEGER NOT NULL DEFAULT 0,
        words_count INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        indexed_at TEXT
      );

      CREATE TABLE IF NOT EXISTS kb_chunks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        doc_id TEXT NOT NULL REFERENCES kb_documents(id) ON DELETE CASCADE,
        chunk_index INTEGER NOT NULL,
        content TEXT NOT NULL,
        word_count INTEGER NOT NULL DEFAULT 0,
        embedding BLOB,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_chunks_doc ON kb_chunks(doc_id);
    `);
  }

  // ── Documents ─────────────────────────────────────────────────────────────

  insertDoc(doc: { id: string; name: string; type: string; sizeBytes: number }): void {
    this.db.prepare(
      'INSERT INTO kb_documents (id, name, type, size_bytes) VALUES (?, ?, ?, ?)',
    ).run(doc.id, doc.name, doc.type, doc.sizeBytes);
  }

  updateDocStatus(
    id: string,
    status: string,
    extra?: { chunksCount?: number; wordsCount?: number; errorMessage?: string },
  ): void {
    const indexedAt = status === 'indexed' ? new Date().toISOString() : null;
    this.db.prepare(`
      UPDATE kb_documents
      SET status = ?, chunks_count = COALESCE(?, chunks_count), words_count = COALESCE(?, words_count),
          error_message = ?, indexed_at = COALESCE(?, indexed_at)
      WHERE id = ?
    `).run(status, extra?.chunksCount ?? null, extra?.wordsCount ?? null, extra?.errorMessage ?? null, indexedAt, id);
  }

  getDoc(id: string): KBDocument | null {
    const row = this.db.prepare('SELECT * FROM kb_documents WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    return row ? this.mapDoc(row) : null;
  }

  listDocs(): KBDocument[] {
    const rows = this.db.prepare('SELECT * FROM kb_documents ORDER BY created_at DESC').all() as Record<string, unknown>[];
    return rows.map((r) => this.mapDoc(r));
  }

  removeDoc(id: string): void {
    this.db.prepare('DELETE FROM kb_documents WHERE id = ?').run(id);
  }

  private mapDoc(row: Record<string, unknown>): KBDocument {
    return {
      id: row.id as string,
      name: row.name as string,
      type: row.type as KBDocument['type'],
      sizeBytes: row.size_bytes as number,
      status: row.status as KBDocument['status'],
      errorMessage: row.error_message as string | undefined,
      chunksCount: row.chunks_count as number,
      wordsCount: row.words_count as number,
      createdAt: row.created_at as string,
      indexedAt: row.indexed_at as string | undefined,
    };
  }

  // ── Chunks ────────────────────────────────────────────────────────────────

  insertChunk(docId: string, chunkIndex: number, content: string, wordCount: number, embedding: Buffer | null): void {
    this.db.prepare(
      'INSERT INTO kb_chunks (doc_id, chunk_index, content, word_count, embedding) VALUES (?, ?, ?, ?, ?)',
    ).run(docId, chunkIndex, content, wordCount, embedding);
  }

  getDocChunks(docId: string): Array<{ chunkIndex: number; content: string; wordCount: number }> {
    const rows = this.db.prepare(
      'SELECT chunk_index, content, word_count FROM kb_chunks WHERE doc_id = ? ORDER BY chunk_index',
    ).all(docId) as Array<Record<string, unknown>>;
    return rows.map((r) => ({
      chunkIndex: r.chunk_index as number,
      content: r.content as string,
      wordCount: r.word_count as number,
    }));
  }

  // ── Embeddings Cache ──────────────────────────────────────────────────────

  loadAllEmbeddings(): void {
    this.embeddingsCache.clear();
    this.chunkMeta.clear();

    const rows = this.db.prepare(`
      SELECT c.id, c.doc_id, c.chunk_index, c.content, c.embedding, d.name as doc_name
      FROM kb_chunks c
      JOIN kb_documents d ON d.id = c.doc_id
      WHERE c.embedding IS NOT NULL AND d.status = 'indexed'
    `).all() as Array<Record<string, unknown>>;

    for (const row of rows) {
      const buf = row.embedding as Buffer;
      const vec = new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
      const id = row.id as number;
      this.embeddingsCache.set(id, vec);
      this.chunkMeta.set(id, {
        docId: row.doc_id as string,
        docName: row.doc_name as string,
        chunkIndex: row.chunk_index as number,
        content: row.content as string,
      });
    }

    console.log(`[KBStore] Loaded ${this.embeddingsCache.size} embeddings into cache`);
  }

  getEmbeddingsCacheSize(): number {
    return this.embeddingsCache.size;
  }

  // ── Search ────────────────────────────────────────────────────────────────

  searchSimilar(queryEmbedding: Float32Array, topK: number): KBSearchResult[] {
    const results: Array<{ id: number; similarity: number }> = [];

    for (const [id, vec] of this.embeddingsCache) {
      const sim = cosineSimilarity(queryEmbedding, vec);
      results.push({ id, similarity: sim });
    }

    results.sort((a, b) => b.similarity - a.similarity);

    return results.slice(0, topK).map((r) => {
      const meta = this.chunkMeta.get(r.id)!;
      return {
        docId: meta.docId,
        docName: meta.docName,
        chunkIndex: meta.chunkIndex,
        content: meta.content,
        similarity: r.similarity,
      };
    });
  }

  keywordSearch(query: string, topK: number): KBSearchResult[] {
    const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    if (words.length === 0) return [];

    const conditions = words.map(() => 'LOWER(c.content) LIKE ?').join(' OR ');
    const params = words.map((w) => `%${w}%`);

    const rows = this.db.prepare(`
      SELECT c.doc_id, c.chunk_index, c.content, d.name as doc_name
      FROM kb_chunks c
      JOIN kb_documents d ON d.id = c.doc_id
      WHERE d.status = 'indexed' AND (${conditions})
      LIMIT ?
    `).all(...params, topK) as Array<Record<string, unknown>>;

    return rows.map((row) => ({
      docId: row.doc_id as string,
      docName: row.doc_name as string,
      chunkIndex: row.chunk_index as number,
      content: row.content as string,
      similarity: 0.5, // keyword match — no real score
    }));
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  getStats(): { totalDocs: number; totalChunks: number; totalSizeBytes: number } {
    const row = this.db.prepare(`
      SELECT COUNT(*) as docs, COALESCE(SUM(size_bytes), 0) as size_bytes FROM kb_documents
    `).get() as Record<string, number>;

    const chunks = this.db.prepare('SELECT COUNT(*) as count FROM kb_chunks').get() as Record<string, number>;

    return {
      totalDocs: row.docs,
      totalChunks: chunks.count,
      totalSizeBytes: row.size_bytes,
    };
  }

  close(): void {
    this.db.close();
  }
}

// ── Cosine Similarity ─────────────────────────────────────────────────────────

function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// ── Singleton ─────────────────────────────────────────────────────────────────

let instance: KBStore | null = null;

export function getKBStore(): KBStore {
  if (!instance) instance = new KBStore();
  return instance;
}
