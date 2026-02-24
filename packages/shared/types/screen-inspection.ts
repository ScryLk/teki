// ═══════════════════════════════════════════════════════════════
// Screen Inspection Engine — Types
// ═══════════════════════════════════════════════════════════════

// ── Capture ──

export type CaptureSource = 'active_window' | 'full_screen' | 'specific_window';
export type CaptureResolution = 'full' | 'half' | 'quarter';

export interface CaptureConfig {
  intervalMs: number;
  source: CaptureSource;
  targetWindowTitle?: string;
  resolution: CaptureResolution;
  excludeOwnWindows: boolean;
  enabled: boolean;
}

export interface CapturedFrame {
  imageBuffer: Buffer;
  imageBase64: string;
  width: number;
  height: number;
  sourceId: string;
  sourceName: string;
  capturedAt: number;
}

// ── Diff ──

export type ChangeType = 'none' | 'minor' | 'significant' | 'popup' | 'window_change' | 'first_frame';

export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
  changeIntensity: number;
}

export interface DiffResult {
  changed: boolean;
  changePercentage: number;
  changeType: ChangeType;
  changedRegions: Region[];
  shouldAnalyze: boolean;
  reason: string;
}

// ── Analysis ──

export interface TextBlock {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

export interface DetectedSoftware {
  id: string;
  name: string;
  confidence: number;
  detectedBy: 'window_title' | 'ocr_content';
  version?: string;
}

export type ErrorSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type ErrorCategory =
  | 'sefaz'
  | 'certificate'
  | 'database'
  | 'network'
  | 'printing'
  | 'windows'
  | 'generic';

export interface PotentialError {
  id: string;
  text: string;
  code?: string;
  severity: ErrorSeverity;
  source: string;
  bbox?: { x0: number; y0: number; x1: number; y1: number };
  softwareContext?: string;
}

export interface AnalysisResult {
  fullText: string;
  textBlocks: TextBlock[];
  detectedSoftware: DetectedSoftware[];
  potentialErrors: PotentialError[];
  needsVisionApi: boolean;
  visionApiReason?: string;
  ocrDurationMs: number;
  analysisDurationMs: number;
}

// ── Software Signatures ──

export interface SoftwareSignature {
  id: string;
  name: string;
  windowPatterns: RegExp[];
  ocrPatterns: { pattern: RegExp; weight: number }[];
  errorCategories: ErrorCategory[];
  versionPattern?: RegExp;
}

// ── Error Patterns ──

export interface ErrorPattern {
  id: string;
  softwareIds: string[];
  pattern: RegExp;
  extractCode?: RegExp;
  severity: ErrorSeverity;
  category: ErrorCategory;
  title: string;
  description: string;
  kbSearchTerms: string[];
  knownCodes?: Record<string, string>;
}

// ── KB Match ──

export type KbMatchType = 'exact_code' | 'keyword' | 'semantic' | 'category';

export interface KbArticleMatch {
  articleId: string;
  title: string;
  excerpt: string;
  relevanceScore: number;
  matchType: KbMatchType;
}

export interface KbMatchResult {
  error: PotentialError;
  matches: KbArticleMatch[];
  bestMatch?: KbArticleMatch;
  searchTermsUsed: string[];
}

// ── Actions ──

export type InspectionActionType =
  | 'open_kb'
  | 'ask_ai'
  | 'copy_error'
  | 'create_ticket_note'
  | 'dismiss'
  | 'add_pattern';

export interface InspectionAction {
  id: string;
  label: string;
  type: InspectionActionType;
  data?: Record<string, unknown>;
}

export interface InspectionAlert {
  id: string;
  timestamp: number;
  software?: DetectedSoftware;
  errors: PotentialError[];
  kbMatches?: KbMatchResult[];
  screenshot?: string;
  actions: InspectionAction[];
}

// ── Pipeline Stats ──

export interface InspectionStats {
  framesCaptured: number;
  framesAnalyzed: number;
  framesSkipped: number;
  errorsDetected: number;
  kbMatchesFound: number;
  alertsSent: number;
  visionApiCalls: number;
  isRunning: boolean;
  lastCaptureAt?: number;
  lastErrorAt?: number;
  currentInterval: number;
}

// ── Pipeline State for UI ──

export type InspectionStatus = 'stopped' | 'running' | 'paused' | 'no_consent';

export interface InspectionState {
  status: InspectionStatus;
  stats: InspectionStats;
  recentAlerts: InspectionAlert[];
  currentSoftware?: DetectedSoftware;
}

// ── User Feedback ──

export type UserActionType =
  | 'opened_kb'
  | 'asked_ai'
  | 'copied_error'
  | 'created_ticket'
  | 'dismissed'
  | 'added_pattern';
