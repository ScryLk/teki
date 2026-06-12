// ─── Utterance segmenter (energy-based VAD) ──────────────────────────────────
// Cuts the reporter channel (system loopback) into utterances delimited by
// pauses. The trigger pipeline only ever evaluates FINISHED utterances —
// never the middle of a sentence.
//
// MVP decision: a self-contained RMS-energy VAD with hangover instead of
// Silero/onnx (no WASM/model assets to bundle in the Electron renderer, fully
// offline). The interface is stream-of-frames in / utterances out, so it can
// be swapped for @ricky0123/vad-web (Silero) without touching callers.

export interface SegmenterConfig {
  sampleRate: number;
  /** RMS threshold above which a frame counts as speech. */
  energyThreshold: number;
  /** Speech shorter than this is discarded as a blip (ms). */
  minSpeechMs: number;
  /** Silence needed after speech to close the utterance (ms). */
  silenceHangoverMs: number;
  /** Hard cap: emit even mid-speech after this long (ms). */
  maxUtteranceMs: number;
  /** Audio kept from just before speech onset (ms). */
  preRollMs: number;
}

export const DEFAULT_SEGMENTER_CONFIG: SegmenterConfig = {
  sampleRate: 48000,
  energyThreshold: 0.012,
  minSpeechMs: 400,
  silenceHangoverMs: 800,
  maxUtteranceMs: 30000,
  preRollMs: 300,
};

export type UtteranceCallback = (samples: Float32Array, durationMs: number) => void;

export class UtteranceSegmenter {
  private config: SegmenterConfig;
  private onUtterance: UtteranceCallback;

  private speaking = false;
  private speechFrames: Float32Array[] = [];
  private speechSamples = 0;
  private silenceSamples = 0;
  private preRoll: Float32Array[] = [];
  private preRollSamples = 0;

  constructor(onUtterance: UtteranceCallback, config: Partial<SegmenterConfig> = {}) {
    this.config = { ...DEFAULT_SEGMENTER_CONFIG, ...config };
    this.onUtterance = onUtterance;
  }

  /** Feed sequential mono frames from the audio graph. */
  push(frame: Float32Array): void {
    const rms = computeRms(frame);
    const { sampleRate } = this.config;

    if (!this.speaking) {
      this.appendPreRoll(frame);
      if (rms >= this.config.energyThreshold) {
        this.speaking = true;
        this.speechFrames = [...this.preRoll];
        this.speechSamples = this.preRollSamples;
        this.silenceSamples = 0;
      }
      return;
    }

    this.speechFrames.push(frame);
    this.speechSamples += frame.length;

    if (rms >= this.config.energyThreshold) {
      this.silenceSamples = 0;
    } else {
      this.silenceSamples += frame.length;
    }

    const speechMs = (this.speechSamples / sampleRate) * 1000;
    const silenceMs = (this.silenceSamples / sampleRate) * 1000;

    if (silenceMs >= this.config.silenceHangoverMs || speechMs >= this.config.maxUtteranceMs) {
      this.finishUtterance();
    }
  }

  /** Flushes any in-progress utterance (e.g. when capture stops). */
  flush(): void {
    if (this.speaking) this.finishUtterance();
  }

  private finishUtterance(): void {
    const { sampleRate } = this.config;
    const voicedSamples = this.speechSamples - this.silenceSamples;
    const voicedMs = (voicedSamples / sampleRate) * 1000;

    if (voicedMs >= this.config.minSpeechMs) {
      const merged = mergeFrames(this.speechFrames, this.speechSamples);
      this.onUtterance(merged, Math.round((this.speechSamples / sampleRate) * 1000));
    }

    this.speaking = false;
    this.speechFrames = [];
    this.speechSamples = 0;
    this.silenceSamples = 0;
    this.preRoll = [];
    this.preRollSamples = 0;
  }

  private appendPreRoll(frame: Float32Array): void {
    this.preRoll.push(frame);
    this.preRollSamples += frame.length;
    const maxSamples = (this.config.preRollMs / 1000) * this.config.sampleRate;
    while (this.preRollSamples > maxSamples && this.preRoll.length > 1) {
      const removed = this.preRoll.shift()!;
      this.preRollSamples -= removed.length;
    }
  }
}

function computeRms(frame: Float32Array): number {
  if (frame.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < frame.length; i++) {
    sum += frame[i] * frame[i];
  }
  return Math.sqrt(sum / frame.length);
}

function mergeFrames(frames: Float32Array[], total: number): Float32Array {
  const merged = new Float32Array(total);
  let offset = 0;
  for (const frame of frames) {
    merged.set(frame, offset);
    offset += frame.length;
  }
  return merged;
}
