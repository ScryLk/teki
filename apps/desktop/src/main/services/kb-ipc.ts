import { ipcMain, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '@teki/shared';
import type { KBUploadPayload, KBDocStatusEvent } from '@teki/shared';
import { getKBService } from './kb-service';
import { getKBStore } from './kb-store';
import { safeSend } from '../utils/safe-ipc';

export function setupKnowledgeBase(mainWindow: BrowserWindow): void {
  const service = getKBService();
  const store = getKBStore();

  // Load embeddings into memory on startup
  store.loadAllEmbeddings();

  ipcMain.handle(IPC_CHANNELS.KB_LIST_DOCS, () => store.listDocs());

  ipcMain.handle(IPC_CHANNELS.KB_GET_DOC, (_e, docId: string) => store.getDoc(docId));

  ipcMain.handle(IPC_CHANNELS.KB_DOC_CHUNKS, (_e, docId: string) => store.getDocChunks(docId));

  ipcMain.handle(IPC_CHANNELS.KB_REMOVE_DOC, (_e, docId: string) => {
    store.removeDoc(docId);
    store.loadAllEmbeddings();
  });

  ipcMain.handle(IPC_CHANNELS.KB_UPLOAD_DOC, (_e, payload: KBUploadPayload) => {
    return service.ingestDocument(payload);
  });

  ipcMain.handle(IPC_CHANNELS.KB_SEARCH, (_e, query: string, topK?: number) => {
    return service.search(query, topK);
  });

  ipcMain.handle(IPC_CHANNELS.KB_GET_STATS, () => {
    const stats = store.getStats();
    return { ...stats, embeddingsLoaded: store.getEmbeddingsCacheSize() > 0 };
  });

  // Push status updates to renderer
  service.on('doc-status', (event: KBDocStatusEvent) => {
    safeSend(mainWindow, IPC_CHANNELS.KB_DOC_STATUS, event);
  });

  console.log('[KB] Knowledge Base IPC registered');
}
