import type { TranscriptionSegment } from '@teki/shared';

type TranscriptCallback = (segment: TranscriptionSegment) => void;
type ErrorCallback = (error: { message: string }) => void;

const GEMINI_WS_URL = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent';

// Dynamic import ws to avoid crash if module not found
let WebSocketClass: typeof import('ws').default | null = null;

async function getWebSocket(): Promise<typeof import('ws').default> {
  if (!WebSocketClass) {
    const ws = await import('ws');
    WebSocketClass = ws.default || ws;
  }
  return WebSocketClass;
}

export class GeminiLiveService {
  private ws: InstanceType<typeof import('ws').default> | null = null;
  private apiKey: string;
  private modelId: string;
  private onTranscriptCb: TranscriptCallback | null = null;
  private onErrorCb: ErrorCallback | null = null;
  private reconnectAttempts = 0;
  private maxReconnects = 3;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private segmentCounter = 0;
  private isPaused = false;
  private isConnected = false;
  private destroyed = false;

  constructor(apiKey: string, modelId = 'gemini-2.0-flash-exp') {
    this.apiKey = apiKey;
    this.modelId = modelId;
  }

  onTranscript(cb: TranscriptCallback): void {
    this.onTranscriptCb = cb;
  }

  onError(cb: ErrorCallback): void {
    this.onErrorCb = cb;
  }

  async connect(): Promise<void> {
    const WS = await getWebSocket();

    return new Promise((resolve, reject) => {
      if (this.destroyed) {
        reject(new Error('Serviço de transcrição foi encerrado.'));
        return;
      }

      const url = `${GEMINI_WS_URL}?key=${this.apiKey}`;

      try {
        this.ws = new WS(url);
      } catch (err) {
        reject(new Error(`Falha ao criar conexão WebSocket: ${err instanceof Error ? err.message : String(err)}`));
        return;
      }

      const timeout = setTimeout(() => {
        if (!this.isConnected) {
          this.safeClose();
          reject(new Error('Timeout ao conectar ao Gemini Live API (10s).'));
        }
      }, 10000);

      this.ws.on('open', () => {
        clearTimeout(timeout);
        this.isConnected = true;
        this.reconnectAttempts = 0;

        try {
          const setup = {
            setup: {
              model: `models/${this.modelId}`,
              generationConfig: {
                responseModalities: ['TEXT'],
              },
              systemInstruction: {
                parts: [{
                  text: 'Você é um transcritor de áudio em tempo real. Transcreva o áudio recebido em português brasileiro de forma precisa. Retorne apenas a transcrição do que foi dito, sem comentários adicionais. Se não conseguir entender, retorne "[inaudível]".',
                }],
              },
            },
          };

          this.ws!.send(JSON.stringify(setup));
          resolve();
        } catch (err) {
          reject(new Error(`Falha ao enviar configuração: ${err instanceof Error ? err.message : String(err)}`));
        }
      });

      this.ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          this.handleMessage(msg);
        } catch {
          // Ignore parse errors
        }
      });

      this.ws.on('close', (code) => {
        clearTimeout(timeout);
        this.isConnected = false;
        if (!this.destroyed && code !== 1000 && this.reconnectAttempts < this.maxReconnects) {
          this.scheduleReconnect();
        }
      });

      this.ws.on('error', (err) => {
        clearTimeout(timeout);
        this.isConnected = false;
        const message = err instanceof Error ? err.message : 'Erro de conexão WebSocket';
        this.onErrorCb?.({ message });
        if (this.reconnectAttempts === 0) {
          reject(new Error(message));
        }
      });
    });
  }

  private handleMessage(msg: Record<string, unknown>): void {
    const serverContent = msg.serverContent as Record<string, unknown> | undefined;
    if (!serverContent) return;

    const modelTurn = serverContent.modelTurn as { parts?: Array<{ text?: string }> } | undefined;
    if (!modelTurn?.parts) return;

    for (const part of modelTurn.parts) {
      if (part.text) {
        const segment: TranscriptionSegment = {
          id: `seg_${++this.segmentCounter}`,
          text: part.text,
          timestamp: Date.now(),
          isFinal: serverContent.turnComplete === true,
        };
        this.onTranscriptCb?.(segment);
      }
    }
  }

  sendAudioChunk(base64PCM: string): void {
    if (!this.ws || this.isPaused || this.destroyed) return;

    try {
      // Check readyState safely
      if (this.ws.readyState === 1 /* OPEN */) {
        this.ws.send(JSON.stringify({
          realtimeInput: {
            mediaChunks: [{
              mimeType: 'audio/pcm;rate=16000',
              data: base64PCM,
            }],
          },
        }));
      }
    } catch {
      // Ignore send errors — socket may have closed between check and send
    }
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  disconnect(): void {
    this.destroyed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = this.maxReconnects;
    this.safeClose();
    this.isConnected = false;
  }

  private safeClose(): void {
    try {
      if (this.ws) {
        this.ws.removeAllListeners();
        if (this.ws.readyState === 0 /* CONNECTING */ || this.ws.readyState === 1 /* OPEN */) {
          this.ws.close(1000);
        }
        this.ws = null;
      }
    } catch {
      this.ws = null;
    }
  }

  get connected(): boolean {
    return this.isConnected;
  }

  private scheduleReconnect(): void {
    if (this.destroyed) return;
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 8000);

    this.reconnectTimer = setTimeout(async () => {
      if (this.destroyed) return;
      try {
        await this.connect();
      } catch {
        // Will retry via close handler if attempts remain
      }
    }, delay);
  }
}
