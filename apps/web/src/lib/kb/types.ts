// ── KB Insertion Types ──

export type InsertionMode = 'quick_add' | 'file_upload' | 'full_form' | 'from_chat';

export type KbArticleStatus = 'draft' | 'published' | 'archived';

export type KbDifficulty = 'basic' | 'intermediate' | 'advanced';

export type KbAudience = 'end_user' | 'technician' | 'admin';

// ── AI Suggestion ──

export interface AiSuggestion {
  title: string;
  summary: string;
  category: string;
  categoryConfidence: number;
  tags: string[];
  difficulty: KbDifficulty;
  targetAudience: KbAudience;
  relatedArticles: string[];
  duplicateWarning?: {
    articleId: string;
    articleTitle: string;
    similarity: number;
  };
}

export interface QuickAddSuggestion extends AiSuggestion {
  structuredContent: string;
  detectedErrorCodes: string[];
  detectedSoftware: string[];
}

export interface FileUploadSuggestion extends AiSuggestion {
  structuredContent: string;
  detectedSections: Array<{ title: string; content: string }>;
  shouldSplitIntoMultiple: boolean;
  suggestedSplits?: Array<{
    title: string;
    summary: string;
    contentRange: { start: number; end: number };
  }>;
}

export interface ChatSuggestion extends AiSuggestion {
  extractedProblem: string;
  extractedSolution: string;
  extractedSteps: string[];
  structuredContent: string;
  chatQuality: 'high' | 'medium' | 'low';
}

// ── Review Form Data ──

export interface KbReviewFormData {
  title: string;
  summary: string;
  content: string;
  categoryId: string;
  tags: string[];
  difficulty: KbDifficulty;
  targetAudience: KbAudience;
  status: KbArticleStatus;
  insertionMode: InsertionMode;
  notifyTeam: boolean;
}

// ── Field tracking ──

export interface AiFieldState {
  source: 'ai' | 'user';
  aiValue?: string;
}

// ── Plan Limits for KB ──

export interface KbPlanLimits {
  maxKbArticles: number;
  maxStorageBytes: number;
  maxFileSizeBytes: number;
  allowedInsertionModes: InsertionMode[];
  allowedFileTypes: string[];
  maxAiSuggestionsPerDay: number;
}

export interface KbUsageSummary {
  articles: { used: number; limit: number; percentage: number };
  storage: {
    usedBytes: number;
    limitBytes: number;
    percentage: number;
    usedFormatted: string;
    limitFormatted: string;
  };
  aiSuggestions: { usedToday: number; limitPerDay: number; percentage: number };
}

export interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  currentUsage?: number;
  limit?: number;
  upgradeRequired?: string;
}

// ── API Response types ──

export interface KbArticleSummary {
  id: string;
  title: string;
  summary: string | null;
  status: string;
  difficulty: string;
  targetAudience: string;
  categoryName: string | null;
  tags: string[];
  insertionMode: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface KbCategoryOption {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  articleCount: number;
}
