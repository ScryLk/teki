// ─── WAV encoding for STT upload ─────────────────────────────────────────────
// Utterances are encoded as 16kHz mono 16-bit PCM WAV — the cheapest format
// every Whisper-compatible endpoint accepts. Audio only ever lives in memory.

export const TARGET_SAMPLE_RATE = 16000;

/** Linear-interpolation downsample to 16kHz. No-op when rates match. */
export function downsampleTo16k(
  input: Float32Array,
  inputSampleRate: number
): Float32Array {
  if (inputSampleRate === TARGET_SAMPLE_RATE) return input;
  const ratio = inputSampleRate / TARGET_SAMPLE_RATE;
  const outLength = Math.floor(input.length / ratio);
  const output = new Float32Array(outLength);
  for (let i = 0; i < outLength; i++) {
    const pos = i * ratio;
    const left = Math.floor(pos);
    const right = Math.min(left + 1, input.length - 1);
    const frac = pos - left;
    output[i] = input[left] * (1 - frac) + input[right] * frac;
  }
  return output;
}

/** Encodes mono float samples as a 16-bit PCM WAV file. */
export function encodeWav16BitMono(
  samples: Float32Array,
  sampleRate: number
): ArrayBuffer {
  const dataLength = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  }

  return buffer;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

/** Full pipeline: float frames at source rate → base64 16kHz WAV. */
export function samplesToBase64Wav(
  samples: Float32Array,
  inputSampleRate: number
): { base64: string; durationMs: number } {
  const downsampled = downsampleTo16k(samples, inputSampleRate);
  const wav = encodeWav16BitMono(downsampled, TARGET_SAMPLE_RATE);
  return {
    base64: arrayBufferToBase64(wav),
    durationMs: Math.round((downsampled.length / TARGET_SAMPLE_RATE) * 1000),
  };
}
