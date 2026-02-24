import { BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '@teki/shared';
import type {
  CapturedFrame,
  InspectionStats,
  InspectionState,
  InspectionStatus,
  InspectionAlert,
} from '@teki/shared';
import { ScreenCaptureLoop, INTERVALS } from './capture.service';
import { ScreenDiffService } from './diff.service';
import { ScreenAnalyzer } from './analyze.service';
import { ErrorExtractor } from './error-patterns';
import { KbMatcherService } from './kb-matcher.service';
import { InspectionActionService } from './action.service';
import { VisionService } from './vision.service';
import settingsStore from '../settings-store';

// ── LGPD Consent ──────────────────────────────────────────────────────────
const SCREEN_CAPTURE_CONSENT = {
  purpose: 'screen_capture' as const,
  required: false, // Opt-in only
};

// ═══════════════════════════════════════════════════════════════
// Pipeline Orchestrator
// Ties all 5 stages together: CAPTURE → DIFF → ANALYZE → DETECT → ACTION
// ═══════════════════════════════════════════════════════════════

export class ScreenInspectorPipeline {
  private captureLoop: ScreenCaptureLoop;
  private diffService: ScreenDiffService;
  private analyzer: ScreenAnalyzer;
  private errorExtractor: ErrorExtractor;
  private kbMatcher: KbMatcherService;
  private actionService: InspectionActionService;
  private visionService: VisionService;

  private mainWindow: BrowserWindow | null = null;
  private consentGranted = false;
  private status: InspectionStatus = 'stopped';
  private recentAlerts: InspectionAlert[] = [];

  // Stats
  private stats: InspectionStats = {
    framesCaptured: 0,
    framesAnalyzed: 0,
    framesSkipped: 0,
    errorsDetected: 0,
    kbMatchesFound: 0,
    alertsSent: 0,
    visionApiCalls: 0,
    isRunning: false,
    currentInterval: INTERVALS.ACTIVE,
  };

  // Error burst tracking
  private errorBurstTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.captureLoop = new ScreenCaptureLoop();
    this.diffService = new ScreenDiffService();
    this.analyzer = new ScreenAnalyzer();
    this.errorExtractor = new ErrorExtractor();
    this.kbMatcher = new KbMatcherService(this.errorExtractor);
    this.actionService = new InspectionActionService();
    this.visionService = new VisionService();
  }

  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
    this.actionService.setMainWindow(window);
  }

  setConsent(granted: boolean): void {
    this.consentGranted = granted;
    if (!granted && this.status === 'running') {
      this.stop();
      this.setStatus('no_consent');
    }
  }

  async start(): Promise<void> {
    // Check LGPD consent
    if (!this.consentGranted) {
      this.setStatus('no_consent');
      return;
    }

    if (this.status === 'running') return;

    // Initialize OCR
    await this.analyzer.initialize();

    // Start capture loop
    this.captureLoop.start((frame) => this.processFrame(frame));

    this.stats.isRunning = true;
    this.setStatus('running');
  }

  stop(): void {
    this.captureLoop.stop();
    this.diffService.reset();
    this.stats.isRunning = false;

    if (this.errorBurstTimer) {
      clearTimeout(this.errorBurstTimer);
      this.errorBurstTimer = null;
    }

    this.setStatus('stopped');
  }

  pause(): void {
    this.captureLoop.pause();
    this.setStatus('paused');
  }

  resume(): void {
    if (!this.consentGranted) {
      this.setStatus('no_consent');
      return;
    }

    this.captureLoop.resume();
    this.setStatus('running');
  }

  getStats(): InspectionStats {
    return {
      ...this.stats,
      visionApiCalls: this.visionService.getCallCount(),
      currentInterval: this.captureLoop.getConfig().intervalMs,
    };
  }

  getState(): InspectionState {
    return {
      status: this.status,
      stats: this.getStats(),
      recentAlerts: this.recentAlerts.slice(-10),
      currentSoftware: undefined, // Will be set from last analysis
    };
  }

  async destroy(): Promise<void> {
    this.stop();
    await this.analyzer.destroy();
  }

  // ── Private Pipeline ─────────────────────────────────────────────────────

  private async processFrame(frame: CapturedFrame): Promise<void> {
    const pipelineStart = Date.now();
    this.stats.framesCaptured++;
    this.stats.lastCaptureAt = Date.now();

    try {
      // Stage 2: DIFF — Should we analyze this frame?
      const diffResult = this.diffService.compare(frame);

      if (!diffResult.shouldAnalyze) {
        this.stats.framesSkipped++;
        return;
      }

      this.stats.framesAnalyzed++;

      // Stage 3 & 4: ANALYZE + DETECT — OCR + software detection + error extraction
      const analysis = await this.analyzer.analyze(frame, diffResult);

      // Stage 4b: KB AUTO-MATCH — Search KB for detected errors
      let kbMatches = analysis.potentialErrors.length > 0
        ? await this.kbMatcher.findMatches(
            analysis.potentialErrors,
            analysis.detectedSoftware[0]
          )
        : [];

      // Stage 5: ACTION — Build and send alert
      if (analysis.potentialErrors.length > 0) {
        this.stats.errorsDetected += analysis.potentialErrors.length;
        this.stats.lastErrorAt = Date.now();

        if (kbMatches.length > 0) {
          this.stats.kbMatchesFound += kbMatches.reduce(
            (sum, m) => sum + m.matches.length, 0
          );
        }

        // Build alert (with deduplication)
        const alert = this.actionService.buildAlert(
          analysis,
          kbMatches,
          frame.imageBase64
        );

        if (alert) {
          this.actionService.sendAlert(alert);
          this.stats.alertsSent++;
          this.recentAlerts.push(alert);

          // Keep only last 20 alerts in memory
          if (this.recentAlerts.length > 20) {
            this.recentAlerts = this.recentAlerts.slice(-20);
          }

          // Increase capture frequency after error detection
          this.enterErrorBurstMode();
        }

        // Stage 8: Vision API enrichment (background, non-blocking)
        if (analysis.needsVisionApi) {
          this.enrichWithVisionApi(frame, alert);
        }
      }

      // Notify renderer of state change
      this.broadcastState();
    } catch (err) {
      console.error('[ScreenInspector] Pipeline error:', err);
    }
  }

  private enterErrorBurstMode(): void {
    // Increase capture frequency to 1.5s for 30 seconds
    this.captureLoop.adjustInterval(INTERVALS.ERROR_DETECTED);

    if (this.errorBurstTimer) {
      clearTimeout(this.errorBurstTimer);
    }

    this.errorBurstTimer = setTimeout(() => {
      this.captureLoop.adjustInterval(INTERVALS.ACTIVE);
      this.errorBurstTimer = null;
    }, 30_000);
  }

  private async enrichWithVisionApi(
    frame: CapturedFrame,
    alert: InspectionAlert | null
  ): Promise<void> {
    try {
      const visionResult = await this.visionService.analyzeScreenshot(frame);
      if (!visionResult || visionResult.errors.length === 0) return;

      // If there are new errors from vision that weren't detected by OCR,
      // we could send a supplementary alert. For now, just log.
      this.stats.visionApiCalls = this.visionService.getCallCount();
    } catch {
      // Vision API enrichment is best-effort
    }
  }

  private setStatus(status: InspectionStatus): void {
    this.status = status;
    this.broadcastState();
  }

  private broadcastState(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;
    this.mainWindow.webContents.send(
      IPC_CHANNELS.INSPECTION_STATUS_CHANGED,
      this.getState()
    );
  }
}

// Singleton instance
export const screenInspector = new ScreenInspectorPipeline();
export default screenInspector;
