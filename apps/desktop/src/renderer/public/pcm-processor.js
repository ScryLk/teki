// AudioWorklet processor for PCM audio capture
// Must be plain JS — AudioWorklet does not support TypeScript
// Captures audio, converts Float32 to Int16 PCM, sends in ~100ms chunks

class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buffer = [];
    // At 16kHz, 100ms = 1600 samples
    this._chunkSize = 1600;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const channelData = input[0]; // mono channel

    // Convert Float32 to Int16 and accumulate
    for (let i = 0; i < channelData.length; i++) {
      // Clamp to [-1, 1] then scale to Int16 range
      const s = Math.max(-1, Math.min(1, channelData[i]));
      this._buffer.push(s < 0 ? s * 0x8000 : s * 0x7fff);
    }

    // Send chunk when we have enough samples
    while (this._buffer.length >= this._chunkSize) {
      const chunk = new Int16Array(this._buffer.splice(0, this._chunkSize));
      this.port.postMessage({ pcmChunk: chunk.buffer }, [chunk.buffer]);
    }

    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);
