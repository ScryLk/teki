import type { TranscriptionSegment, AISuggestion } from '@teki/shared';
import settingsStore from './settings-store';

type SuggestionCallback = (suggestion: AISuggestion) => void;

const ANALYSIS_DEBOUNCE_MS = 30_000;
const GEMINI_REST_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export class TranscriptionAnalyzer {
  private segments: TranscriptionSegment[] = [];
  private lastAnalyzedIndex = 0;
  private suggestionCounter = 0;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private onSuggestionCb: SuggestionCallback | null = null;

  onSuggestion(cb: SuggestionCallback): void {
    this.onSuggestionCb = cb;
  }

  addSegment(segment: TranscriptionSegment): void {
    this.segments.push(segment);

    // Only analyze final segments and debounce
    if (segment.isFinal) {
      this.scheduleAnalysis();
    }
  }

  private scheduleAnalysis(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      this.analyze();
    }, ANALYSIS_DEBOUNCE_MS);
  }

  private async analyze(): Promise<void> {
    const newSegments = this.segments.slice(this.lastAnalyzedIndex);
    if (newSegments.length === 0) return;

    this.lastAnalyzedIndex = this.segments.length;

    const transcript = newSegments
      .filter((s) => s.isFinal)
      .map((s) => s.text)
      .join(' ');

    if (transcript.trim().length < 20) return;

    const apiKey = settingsStore.get('geminiApiKey' as never) as string;
    if (!apiKey) return;

    const fullContext = this.segments
      .filter((s) => s.isFinal)
      .map((s) => s.text)
      .join(' ');

    const prompt = `Analise a seguinte transcrição de uma chamada em tempo real e forneça sugestões úteis.

Transcrição completa até agora:
"${fullContext}"

Trecho mais recente:
"${transcript}"

Retorne um JSON array com sugestões. Cada sugestão deve ter:
- "type": um de "summary", "action_item", "question", "insight"
- "content": texto da sugestão em português
- "confidence": número de 0 a 1

Retorne APENAS o JSON array, sem markdown ou texto adicional. Se não houver sugestões relevantes, retorne [].`;

    try {
      const response = await fetch(
        `${GEMINI_REST_URL}/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1024,
            },
          }),
        },
      );

      if (!response.ok) return;

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return;

      // Parse JSON from response (handle possible markdown wrapping)
      const jsonStr = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      const suggestions = JSON.parse(jsonStr) as Array<{
        type: string;
        content: string;
        confidence: number;
      }>;

      for (const s of suggestions) {
        if (['summary', 'action_item', 'question', 'insight'].includes(s.type)) {
          const suggestion: AISuggestion = {
            id: `sug_${++this.suggestionCounter}`,
            type: s.type as AISuggestion['type'],
            content: s.content,
            confidence: Math.max(0, Math.min(1, s.confidence)),
            createdAt: Date.now(),
          };
          this.onSuggestionCb?.(suggestion);
        }
      }
    } catch {
      // Silently fail — suggestions are non-critical
    }
  }

  reset(): void {
    this.segments = [];
    this.lastAnalyzedIndex = 0;
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  getSegments(): TranscriptionSegment[] {
    return [...this.segments];
  }
}
