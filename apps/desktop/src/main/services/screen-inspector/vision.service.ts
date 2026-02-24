import type { CapturedFrame, PotentialError, DetectedSoftware } from '@teki/shared';
import settingsStore from '../settings-store';

// ═══════════════════════════════════════════════════════════════
// Vision API Service
// Uses configured AI providers to analyze screenshots when
// local OCR is insufficient
// ═══════════════════════════════════════════════════════════════

interface VisionAnalysisResult {
  errors: PotentialError[];
  software?: DetectedSoftware;
  rawText: string;
  confidence: number;
  costUsd: number;
}

const VISION_PROMPT = `Analyze this screenshot from a technical support context. Look for:
1. Error messages, dialog boxes, or warning notifications
2. The software being used (name and version if visible)
3. Error codes (especially SEFAZ rejection codes, HTTP status codes, database errors)
4. Any text that indicates a problem or failure

Respond in JSON format:
{
  "errors": [{ "text": "full error message", "code": "error code if any", "severity": "critical|high|medium|low" }],
  "software": { "name": "software name", "version": "version if visible" },
  "rawText": "all text visible on screen",
  "hasProblems": true/false
}`;

export class VisionService {
  private apiCallCount = 0;
  private totalCostUsd = 0;

  async analyzeScreenshot(frame: CapturedFrame): Promise<VisionAnalysisResult | null> {
    const model = settingsStore.get('selectedModel');
    const imageBase64 = frame.imageBase64;

    // Try Gemini first (most cost-effective for vision)
    const geminiKey = settingsStore.get('geminiApiKey');
    if (geminiKey) {
      return this.analyzeWithGemini(imageBase64, geminiKey);
    }

    // Fallback to OpenAI
    const openaiKey = settingsStore.get('openaiApiKey');
    if (openaiKey) {
      return this.analyzeWithOpenai(imageBase64, openaiKey);
    }

    // Fallback to Anthropic
    const anthropicKey = settingsStore.get('anthropicApiKey');
    if (anthropicKey) {
      return this.analyzeWithAnthropic(imageBase64, anthropicKey);
    }

    return null; // No provider configured
  }

  getCallCount(): number {
    return this.apiCallCount;
  }

  getTotalCost(): number {
    return this.totalCostUsd;
  }

  private async analyzeWithGemini(
    imageBase64: string,
    apiKey: string
  ): Promise<VisionAnalysisResult | null> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: VISION_PROMPT },
                {
                  inlineData: {
                    mimeType: 'image/png',
                    data: imageBase64,
                  },
                },
              ],
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      this.apiCallCount++;

      // Estimate cost (Gemini Flash is very cheap)
      const costUsd = 0.0005;
      this.totalCostUsd += costUsd;

      return this.parseVisionResponse(text, costUsd);
    } catch {
      return null;
    }
  }

  private async analyzeWithOpenai(
    imageBase64: string,
    apiKey: string
  ): Promise<VisionAnalysisResult | null> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: VISION_PROMPT },
                {
                  type: 'image_url',
                  image_url: { url: `data:image/png;base64,${imageBase64}` },
                },
              ],
            },
          ],
          max_tokens: 1024,
          temperature: 0.1,
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content ?? '';
      this.apiCallCount++;

      const costUsd = 0.002;
      this.totalCostUsd += costUsd;

      return this.parseVisionResponse(text, costUsd);
    } catch {
      return null;
    }
  }

  private async analyzeWithAnthropic(
    imageBase64: string,
    apiKey: string
  ): Promise<VisionAnalysisResult | null> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/png',
                    data: imageBase64,
                  },
                },
                { type: 'text', text: VISION_PROMPT },
              ],
            },
          ],
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      const text = data.content?.[0]?.text ?? '';
      this.apiCallCount++;

      const costUsd = 0.001;
      this.totalCostUsd += costUsd;

      return this.parseVisionResponse(text, costUsd);
    } catch {
      return null;
    }
  }

  private parseVisionResponse(text: string, costUsd: number): VisionAnalysisResult | null {
    try {
      // Extract JSON from response (it may be wrapped in markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      const parsed = JSON.parse(jsonMatch[0]);

      const errors: PotentialError[] = (parsed.errors ?? []).map(
        (e: Record<string, unknown>, i: number) => ({
          id: `vision_${Date.now()}_${i}`,
          text: String(e.text ?? ''),
          code: e.code ? String(e.code) : undefined,
          severity: (['critical', 'high', 'medium', 'low', 'info'].includes(String(e.severity))
            ? String(e.severity)
            : 'medium') as PotentialError['severity'],
          source: 'vision_api',
        })
      );

      const software: DetectedSoftware | undefined = parsed.software?.name
        ? {
            id: `vision_${String(parsed.software.name).toLowerCase().replace(/\s+/g, '_')}`,
            name: String(parsed.software.name),
            confidence: 0.8,
            detectedBy: 'ocr_content',
            version: parsed.software.version ? String(parsed.software.version) : undefined,
          }
        : undefined;

      return {
        errors,
        software,
        rawText: String(parsed.rawText ?? ''),
        confidence: 0.85,
        costUsd,
      };
    } catch {
      return null;
    }
  }
}

export default VisionService;
