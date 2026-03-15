// ─── Transcription Types ──────────────────────────────────────────────────────

export type TranscriptionStatus = 'idle' | 'selecting' | 'recording' | 'paused' | 'error';

export interface TranscriptionSegment {
  id: string;
  text: string;
  speaker?: string;
  timestamp: number;
  isFinal: boolean;
}

export interface AISuggestion {
  id: string;
  type: 'summary' | 'action_item' | 'question' | 'insight';
  content: string;
  confidence: number;
  createdAt: number;
}

export interface AudioSource {
  id: string;
  name: string;
  thumbnail?: string;
  type: 'window' | 'screen';
}

export interface TranscriptionConfig {
  sampleRate: number;
  language: string;
  modelId: string;
}

export const DEFAULT_TRANSCRIPTION_CONFIG: TranscriptionConfig = {
  sampleRate: 16000,
  language: 'pt-BR',
  modelId: 'gemini-2.0-flash-exp',
};
