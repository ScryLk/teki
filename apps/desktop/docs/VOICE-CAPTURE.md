# Captura de áudio — Voice Listening

Como o app desktop captura o áudio da chamada VoIP para a feature
"Teki escuta a chamada".

## Dois canais separados

| Canal | Fonte | Uso |
|-------|-------|-----|
| **A — Microfone** | `getUserMedia` (voz do técnico) | Capturado em stream próprio; **nunca** alimenta o trigger |
| **B — Loopback do sistema** | `electron-audio-loopback` + `getDisplayMedia` (voz do relator na chamada) | VAD → utterances → STT → trigger de sugestão |

Essa separação dá distinção de locutor **sem diarização** no MVP: tudo que sai
da caixa de som (Teams/Meet/Zoom) é o relator; o microfone é o técnico.

## Por que `electron-audio-loopback`

- `getDisplayMedia` puro retorna **silêncio no macOS** — a lib resolve via
  `setDisplayMediaRequestHandler` com `audio: 'loopback'` no main process.
- Suporta macOS 12.3+, Windows 10+ e Linux **sem drivers de terceiros**.
- Requer Electron ≥ 31 (o projeto usa 33.x).

Detalhe importante: `getDisplayMedia` **exige `video: true`** — o renderer pede
o vídeo, descarta a track imediatamente e mantém só o áudio do sistema
(ver `src/renderer/floating/voice/useVoiceListening.ts`).

## Por que a versão do Electron está PINADA

A captura de loopback tem histórico de **regressões entre versões major** do
Electron (ex.: quebrou na série 40). Por isso:

1. `package.json` fixa `"electron": "33.4.0"` (sem `^`).
2. Existe um smoke test por plataforma: `pnpm --filter @teki/desktop smoke:loopback`.

**Antes de qualquer bump do Electron**, rode o smoke test em macOS, Windows e
Linux. Só faça o bump se passar nos três.

## VAD / segmentação

O canal B é cortado em **utterances** delimitados por pausa
(`src/renderer/floating/voice/utterance-segmenter.ts`). O trigger nunca avalia
no meio de uma frase — só utterances finalizados sobem para a API.

Decisão de MVP: VAD por energia (RMS + hangover), sem dependências
WASM/onnx — 100% offline e sem assets para empacotar. A interface
(frames in → utterances out) permite trocar por Silero
(`@ricky0123/vad-web`) sem alterar os consumidores.

## LGPD

- Captura só inicia com **consentimento explícito** (`AUDIO_RECORDING`,
  registrado no servidor) — modal antes da primeira ativação.
- Indicador **"Teki está ouvindo"** permanece visível durante toda a captura.
- Áudio bruto é processado **em memória** e descartado: nunca vai para disco,
  storage ou logs — nem no desktop, nem no servidor.
- Parar a escuta é 1 clique (botão "parar" no indicador).
