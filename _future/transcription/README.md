# Transcrição de Chamadas em Tempo Real

## Status
⏸️ Feature pausada — código preservado para implementação futura.

## O que esta feature faz

Fluxo completo:
```
desktopCapturer → AudioWorklet (PCM 16kHz) → Gemini Live API (WebSocket)
→ transcrição em tempo real → análise de contexto com Gemini Flash
→ sugestões categorizadas (summary / action_item / question / insight)
```

1. Captura áudio do sistema via `getDisplayMedia()` com loopback
2. Converte para PCM Int16 a 16kHz usando AudioWorklet
3. Envia chunks base64 via IPC para o main process
4. Main process encaminha para Gemini Live API via WebSocket
5. Transcrição retorna em tempo real como `TranscriptionSegment`
6. `TranscriptionAnalyzer` acumula segmentos e gera sugestões com Gemini Flash REST API
7. Floating window exibe transcrição em tempo real com UI animada

## Dependências externas necessárias

- `@google/generative-ai` com suporte ao Gemini Live API (WebSocket)
- `ws` (WebSocket client para Node.js — já presente no projeto)
- `whisper.cpp` compilado para win32 / darwin / linux (modo offline — não implementado)
- Binário de modelo `ggml-small.bin` (~142MB, download sob demanda)
- **macOS**: permissão de Gravação de Tela (Screen Recording) no System Preferences

## Estrutura dos arquivos

```
_future/transcription/
├── README.md                          ← este arquivo
├── services/
│   ├── gemini-live-service.ts         ← WebSocket Gemini Live API
│   └── transcription-analyzer.ts      ← análise + sugestões via Gemini Flash REST
├── ipc/
│   └── transcription-ipc.ts          ← handlers IPC: start/stop/chunk/pause/resume
├── types/
│   └── transcription.ts              ← TranscriptionSegment, AISuggestion, AudioSource, etc.
├── components/
│   ├── WindowPicker.tsx               ← modal para selecionar janela/app a capturar
│   ├── TranscriptionPanel.tsx         ← painel principal com segmentos + timer + controles
│   └── SuggestionCard.tsx             ← card de sugestão da IA com confiança + copiar
├── floating-components/
│   ├── TranscriptionDisplay.tsx       ← display de transcrição na floating window
│   ├── SuggestionPanel.tsx            ← painel de sugestão na floating window
│   └── StreamingItalicText.tsx        ← animação typewriter de texto
├── hooks/
│   └── useTranscription.ts            ← hook que orquestra IPC + audio capture + store
├── stores/
│   └── transcription-store.ts         ← Zustand store (status, segments, suggestions)
└── utils/
    └── pcm-processor.js               ← AudioWorklet para Float32→Int16 PCM
```

## Passos para reintegrar

### 1. Restaurar tipos compartilhados
- Copiar `types/transcription.ts` → `packages/shared/types/transcription.ts`
- Adicionar `export * from './types/transcription';` em `packages/shared/index.ts`
- Adicionar import em `packages/shared/types/ipc.ts`:
  ```ts
  import type { AudioSource, TranscriptionSegment, AISuggestion, TranscriptionConfig } from './transcription';
  ```

### 2. Restaurar IPC channels em `packages/shared/types/ipc.ts`
Adicionar ao `IPC_CHANNELS`:
```ts
// Transcription
TRANSCRIPTION_GET_SOURCES: 'transcription:getSources',
TRANSCRIPTION_START:       'transcription:start',
TRANSCRIPTION_STOP:        'transcription:stop',
TRANSCRIPTION_PAUSE:       'transcription:pause',
TRANSCRIPTION_RESUME:      'transcription:resume',
TRANSCRIPTION_SEND_CHUNK:  'transcription:sendChunk',
TRANSCRIPTION_SEGMENT:     'transcription:segment',
TRANSCRIPTION_SUGGESTION:  'transcription:suggestion',
TRANSCRIPTION_ERROR:       'transcription:error',
```

### 3. Restaurar TekiAPI interface em `packages/shared/types/ipc.ts`
Adicionar à interface `TekiAPI`:
```ts
transcriptionCheckPermission: () => Promise<{ granted: boolean }>;
transcriptionOpenScreenSettings: () => Promise<void>;
transcriptionGetSources: () => Promise<AudioSource[]>;
transcriptionStart: (sourceId: string, config?: Partial<TranscriptionConfig>) => Promise<void>;
transcriptionStop: () => Promise<{ segments: TranscriptionSegment[] }>;
transcriptionPause: () => Promise<void>;
transcriptionResume: () => Promise<void>;
transcriptionSendChunk: (base64: string) => void;
onTranscriptionSegment: (callback: (segment: TranscriptionSegment) => void) => () => void;
onTranscriptionSuggestion: (callback: (suggestion: AISuggestion) => void) => () => void;
onTranscriptionError: (callback: (error: { message: string }) => void) => () => void;
```

### 4. Restaurar serviços no main process
- Copiar `services/gemini-live-service.ts` → `apps/desktop/src/main/services/`
- Copiar `services/transcription-analyzer.ts` → `apps/desktop/src/main/services/`
- Copiar `ipc/transcription-ipc.ts` → `apps/desktop/src/main/transcription-ipc.ts`

### 5. Registrar IPC no main process (`apps/desktop/src/main/index.ts`)
```ts
import { setupTranscriptionIPC } from './transcription-ipc';
// Adicionar import do desktopCapturer:
import { app, BrowserWindow, desktopCapturer, session, ... } from 'electron';

// Em app.whenReady():
session.defaultSession.setDisplayMediaRequestHandler(async (_request, callback) => {
  const sources = await desktopCapturer.getSources({ types: ['screen'] });
  callback({ video: sources[0], audio: 'loopback' });
});
setupTranscriptionIPC(mainWindow);
```

### 6. Restaurar preload bridges
- Adicionar métodos de transcrição em `apps/desktop/src/preload/index.ts`
- Adicionar métodos na floating preload `apps/desktop/src/preload/floating.ts`

### 7. Restaurar componentes de renderer
- Copiar `components/` → `apps/desktop/src/renderer/components/transcription/`
- Copiar `floating-components/` → `apps/desktop/src/renderer/floating/components/`
- Copiar `hooks/useTranscription.ts` → `apps/desktop/src/renderer/hooks/`
- Copiar `hooks/useAudioCapture.ts` → `apps/desktop/src/renderer/hooks/`  (se necessário)
- Copiar `stores/transcription-store.ts` → `apps/desktop/src/renderer/stores/`
- Copiar `utils/pcm-processor.js` → `apps/desktop/src/renderer/public/`

### 8. Restaurar contexto de transcrição no chat
- Em `apps/desktop/src/renderer/services/ai-service.ts`, adicionar `transcription?: string` na `ChatContext`
- Em `apps/desktop/src/renderer/hooks/useChat.ts`, importar `useTranscriptionStore` e injetar segmentos como contexto

### 9. Adicionar rota da TranscriptionPage no router (se necessário)

### 10. Aplicar gate de plano PRO+ na entrada da feature

### 11. Verificar build
```bash
pnpm build
```

## Decisões em aberto

- Salvar transcrições no histórico? → tabela `transcriptions` no PostgreSQL com FK para `sessions`
- Modo offline (Whisper) incluso no PRO ou plano separado?
- Download do modelo `ggml-small.bin` deve ser feito no onboarding ou sob demanda?
- Aviso de privacidade para o usuário antes de iniciar captura de áudio?
