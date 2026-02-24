import type {
  CapturedFrame,
  DiffResult,
  AnalysisResult,
  TextBlock,
  DetectedSoftware,
  PotentialError,
  Region,
} from '@teki/shared';
import { SoftwareDetector } from './software-detector';
import { ErrorExtractor } from './error-patterns';
import { getActiveWindow } from '../window-detector';

// Tesseract.js is loaded dynamically to avoid startup cost
let Tesseract: typeof import('tesseract.js') | null = null;
let worker: Awaited<ReturnType<typeof import('tesseract.js')['createWorker']>> | null = null;

const MIN_OCR_CONFIDENCE = 60;
const MIN_TEXT_LENGTH = 20;

export class ScreenAnalyzer {
  private softwareDetector: SoftwareDetector;
  private errorExtractor: ErrorExtractor;
  private initialized = false;

  constructor() {
    this.softwareDetector = new SoftwareDetector();
    this.errorExtractor = new ErrorExtractor();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      Tesseract = await import('tesseract.js');
      worker = await Tesseract.createWorker('por+eng');
      this.initialized = true;
    } catch (err) {
      console.error('[ScreenAnalyzer] Failed to initialize Tesseract:', err);
    }
  }

  async analyze(
    frame: CapturedFrame,
    diffResult: DiffResult
  ): Promise<AnalysisResult> {
    const startTime = Date.now();

    if (!this.initialized) {
      await this.initialize();
    }

    // Get active window info for software detection by title
    const activeWin = await getActiveWindow();

    // Detect software from window title (high confidence, fast)
    const titleSoftware = this.softwareDetector.detectFromTitle(activeWin.title);

    // Perform OCR
    let ocrStartTime = Date.now();
    let fullText = '';
    let textBlocks: TextBlock[] = [];
    let avgConfidence = 0;

    if (worker) {
      try {
        // If popup detected, do partial OCR on the changed region
        const imageData = diffResult.changeType === 'popup' && diffResult.changedRegions.length > 0
          ? this.getRegionImageData(frame, diffResult.changedRegions)
          : frame.imageBuffer;

        const result = await worker.recognize(imageData);

        fullText = result.data.text;
        avgConfidence = result.data.confidence;

        textBlocks = result.data.words
          .filter((w) => w.confidence > 30)
          .map((w) => ({
            text: w.text,
            confidence: w.confidence,
            bbox: {
              x0: w.bbox.x0,
              y0: w.bbox.y0,
              x1: w.bbox.x1,
              y1: w.bbox.y1,
            },
          }));
      } catch {
        // OCR failed silently
      }
    }

    const ocrDurationMs = Date.now() - ocrStartTime;

    // Detect software from OCR content (medium confidence)
    const ocrSoftware = this.softwareDetector.detectFromOcr(fullText);

    // Merge software detections (title first, then OCR)
    const detectedSoftware = this.mergeSoftwareDetections(titleSoftware, ocrSoftware);

    // Extract error patterns
    const softwareContext = detectedSoftware.length > 0 ? detectedSoftware[0].id : undefined;
    const potentialErrors = this.errorExtractor.extract(fullText, softwareContext, textBlocks);

    // Determine if Vision API is needed
    const { needsVisionApi, visionApiReason } = this.shouldUseVisionApi(
      avgConfidence,
      fullText,
      potentialErrors,
      detectedSoftware
    );

    const analysisDurationMs = Date.now() - startTime;

    return {
      fullText,
      textBlocks,
      detectedSoftware,
      potentialErrors,
      needsVisionApi,
      visionApiReason,
      ocrDurationMs,
      analysisDurationMs,
    };
  }

  async destroy(): Promise<void> {
    if (worker) {
      await worker.terminate();
      worker = null;
    }
    this.initialized = false;
  }

  private shouldUseVisionApi(
    ocrConfidence: number,
    fullText: string,
    errors: PotentialError[],
    software: DetectedSoftware[]
  ): { needsVisionApi: boolean; visionApiReason?: string } {
    // Low OCR confidence
    if (ocrConfidence > 0 && ocrConfidence < MIN_OCR_CONFIDENCE) {
      return {
        needsVisionApi: true,
        visionApiReason: `Low OCR confidence (${ocrConfidence.toFixed(0)}%)`,
      };
    }

    // Very little text extracted
    if (fullText.trim().length < MIN_TEXT_LENGTH) {
      return {
        needsVisionApi: true,
        visionApiReason: `Insufficient text extracted (${fullText.trim().length} chars)`,
      };
    }

    // Only generic errors found — Vision API might identify specific ones
    const hasOnlyGenericErrors =
      errors.length > 0 && errors.every((e) => e.source === 'generic');
    if (hasOnlyGenericErrors) {
      return {
        needsVisionApi: true,
        visionApiReason: 'Only generic error patterns detected',
      };
    }

    // Software detected but no known errors — might have visual errors
    if (software.length > 0 && errors.length === 0 && fullText.length > MIN_TEXT_LENGTH) {
      return {
        needsVisionApi: true,
        visionApiReason: `Software detected (${software[0].name}) but no errors found via OCR`,
      };
    }

    return { needsVisionApi: false };
  }

  private getRegionImageData(frame: CapturedFrame, regions: Region[]): Buffer {
    // For popup detection, we still send the full frame to OCR
    // Tesseract handles the full image and we can crop results later
    // This is simpler and more reliable than cropping
    return frame.imageBuffer;
  }

  private mergeSoftwareDetections(
    titleDetections: DetectedSoftware[],
    ocrDetections: DetectedSoftware[]
  ): DetectedSoftware[] {
    const merged = new Map<string, DetectedSoftware>();

    // Title detections have higher confidence
    for (const sw of titleDetections) {
      merged.set(sw.id, sw);
    }

    // Only add OCR detections that aren't already found by title
    for (const sw of ocrDetections) {
      if (!merged.has(sw.id)) {
        merged.set(sw.id, sw);
      }
    }

    return Array.from(merged.values());
  }
}

export default ScreenAnalyzer;
