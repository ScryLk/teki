import { create } from 'zustand';
import type { TranscriptionStatus, TranscriptionSegment, AISuggestion, AudioSource } from '@teki/shared';

interface TranscriptionState {
  status: TranscriptionStatus;
  segments: TranscriptionSegment[];
  suggestions: AISuggestion[];
  selectedSource: AudioSource | null;
  error: string | null;
  startTime: number | null;

  // Actions
  setStatus: (status: TranscriptionStatus) => void;
  addSegment: (segment: TranscriptionSegment) => void;
  updateSegment: (id: string, text: string, isFinal: boolean) => void;
  addSuggestion: (suggestion: AISuggestion) => void;
  setSelectedSource: (source: AudioSource | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useTranscriptionStore = create<TranscriptionState>((set) => ({
  status: 'idle',
  segments: [],
  suggestions: [],
  selectedSource: null,
  error: null,
  startTime: null,

  setStatus: (status) => set((state) => ({
    status,
    startTime: status === 'recording' ? (state.startTime ?? Date.now()) : state.startTime,
    error: status === 'recording' ? null : state.error,
  })),

  addSegment: (segment) => set((state) => ({
    segments: [...state.segments, segment],
  })),

  updateSegment: (id, text, isFinal) => set((state) => ({
    segments: state.segments.map((s) => (s.id === id ? { ...s, text, isFinal } : s)),
  })),

  addSuggestion: (suggestion) => set((state) => ({
    suggestions: [...state.suggestions, suggestion],
  })),

  setSelectedSource: (source) => set({ selectedSource: source }),

  setError: (error) => set({ error, status: error ? 'error' : 'idle' }),

  reset: () => set({
    status: 'idle',
    segments: [],
    suggestions: [],
    selectedSource: null,
    error: null,
    startTime: null,
  }),
}));
