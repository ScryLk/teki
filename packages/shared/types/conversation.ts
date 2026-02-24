// ═══════════════════════════════════════════════════════════════
// Conversation Schema Types
// Covers: conversations, participants, messages, AI metadata,
// sources, feedback, attachments, and tags
// ═══════════════════════════════════════════════════════════════

// ── Conversation ──

export type ConversationType =
  | 'ai_chat'
  | 'floating'
  | 'internal_note'
  | 'support_chat'
  | 'bot_flow'
  | 'voice_transcript'
  | 'group_chat';

export type ConversationStatus = 'active' | 'archived' | 'closed' | 'deleted';

export interface ConversationSettings {
  ai_provider?: string;
  ai_model?: string;
  ai_system_prompt_override?: string | null;
  ai_temperature?: number;
  ai_max_tokens?: number;
  threading_enabled?: boolean;
  auto_title?: boolean;
  language?: string;
  encryption_enabled?: boolean;
}

export interface ConversationContext {
  ticket_id?: string;
  ticket_number?: string;
  screen_capture_active?: boolean;
  audio_capture_active?: boolean;
  detected_software?: string[];
  detected_errors?: string[];
  kb_article_id?: string;
  customer_id?: string;
  channel?: string;
  call_recording_id?: string;
  duration_seconds?: number;
  visibility?: string;
}

// ── Participants ──

export type ParticipantRole = 'creator' | 'participant' | 'observer' | 'mentioned';
export type ParticipantStatus = 'active' | 'left' | 'removed' | 'muted';
export type NotificationLevel = 'all' | 'mentions' | 'none';

// ── Messages ──

export type SenderType = 'user' | 'ai' | 'system' | 'bot';

export type MessageContentType =
  | 'text'
  | 'rich_text'
  | 'code'
  | 'image'
  | 'file'
  | 'audio'
  | 'system_event'
  | 'suggestion'
  | 'template'
  | 'composite';

export type MessageStatus =
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'edited'
  | 'deleted'
  | 'failed'
  | 'streaming';

export interface ContentBlock {
  type: 'text' | 'code' | 'image' | 'event' | 'suggestion';
  content?: string;
  language?: string;
  url?: string;
  alt?: string;
  event?: string;
  data?: Record<string, unknown>;
  title?: string;
  confidence?: number;
  source?: string;
  actions?: SuggestionAction[];
}

export interface SuggestionAction {
  label: string;
  action: string;
  article_id?: string;
}

export interface Mention {
  type: 'user' | 'role' | 'all';
  user_id?: string;
  role?: string;
  display: string;
}

// ── AI Metadata ──

export type AiProvider = 'anthropic' | 'google' | 'openai' | 'deepseek' | 'groq';

export interface AiMetadataSnapshot {
  provider: string;
  model: string;
  tokensInput: number;
  tokensOutput: number;
  costInputUsd: number;
  costOutputUsd: number;
  latencyMs: number;
  timeToFirstTokenMs?: number;
  wasStreamed: boolean;
  wasFallback: boolean;
  originalProvider?: string;
  originalModel?: string;
}

// ── Sources ──

export type SourceType =
  | 'kb_article'
  | 'kb_search'
  | 'web_search'
  | 'web_page'
  | 'ticket_history'
  | 'conversation'
  | 'uploaded_file'
  | 'screen_capture'
  | 'audio_transcript'
  | 'ai_knowledge'
  | 'template'
  | 'api_response'
  | 'database_query';

// ── Feedback ──

export type FeedbackRating = 'positive' | 'negative' | 'mixed';

export type FeedbackTag =
  | 'accurate'
  | 'inaccurate'
  | 'incomplete'
  | 'too_verbose'
  | 'too_brief'
  | 'wrong_solution'
  | 'good_solution'
  | 'outdated'
  | 'helpful_sources'
  | 'irrelevant_sources'
  | 'fast'
  | 'slow';

export type FeedbackAction =
  | 'used_as_is'
  | 'used_modified'
  | 'discarded'
  | 'saved_to_kb'
  | 'escalated';

export interface FeedbackContext {
  provider: string;
  model: string;
  was_streaming: boolean;
  response_time_ms: number;
  sources_count: number;
  conversation_turn: number;
}

// ── Attachments ──

export type AttachmentCategory =
  | 'image'
  | 'screenshot'
  | 'document'
  | 'audio'
  | 'video'
  | 'log_file'
  | 'code'
  | 'file';

export type AttachmentProcessingStatus =
  | 'uploaded'
  | 'processing'
  | 'completed'
  | 'failed';

export interface AttachmentProcessingResult {
  // Image/screenshot
  ocr_text?: string;
  ocr_language?: string;
  detected_errors?: string[];
  // Audio
  transcript?: string;
  duration_seconds?: number;
  language?: string;
  model?: string;
  // Document
  extracted_text?: string;
  page_count?: number;
  word_count?: number;
}

export interface ImageMetadata {
  width: number;
  height: number;
  dpi?: number;
}

export interface AudioMetadata {
  sample_rate: number;
  channels: number;
  codec: string;
}

export interface ScreenshotMetadata {
  source_app?: string;
  monitor?: number;
  region?: { x: number; y: number; w: number; h: number };
}

// ── Conversation List Item (for UI) ──

export interface ConversationListItem {
  id: string;
  type: ConversationType;
  title: string | null;
  status: ConversationStatus;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  messageCount: number;
  totalAiCostUsd: number;
  unread: number;
  isPinned: boolean;
  isMuted: boolean;
}

// ── Message with Metadata (for UI) ──

export interface MessageWithMetadata {
  id: string;
  senderType: SenderType;
  senderId: string | null;
  senderName: string | null;
  senderAvatar: string | null;
  contentType: MessageContentType;
  content: string | null;
  contentBlocks: ContentBlock[] | null;
  parentMessageId: string | null;
  threadMessageCount: number;
  mentions: Mention[] | null;
  status: MessageStatus;
  isPinned: boolean;
  isAiGenerated: boolean;
  createdAt: string;
  editedAt: string | null;
  // AI metadata (only for AI messages)
  provider?: string;
  model?: string;
  tokensTotal?: number;
  costTotalUsd?: number;
  latencyMs?: number;
  wasFallback?: boolean;
  // Counts
  sourcesCount: number;
  myFeedback: FeedbackRating | null;
}
