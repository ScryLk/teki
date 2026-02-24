// ═══════════════════════════════════════════════════════════════
// User Schema Types — LGPD/GDPR Compliant
// ═══════════════════════════════════════════════════════════════

// ── Status & Enums ──

export type UserStatus =
  | 'pending_verification'
  | 'active'
  | 'suspended'
  | 'deactivated'
  | 'anonymized';

export type MemberRole =
  | 'owner'
  | 'admin'
  | 'agent'
  | 'viewer'
  | 'billing'
  | 'custom';

export type MemberStatus = 'invited' | 'active' | 'suspended' | 'removed';

export type AuthProvider = 'google' | 'github' | 'microsoft' | 'saml' | 'oidc';

export type HashAlgorithm = 'argon2id' | 'bcrypt';

export type MfaMethod = 'totp' | 'sms' | 'email';

export type Theme = 'dark' | 'light' | 'system';

export type DeviceType = 'desktop_app' | 'web_browser' | 'mobile_app' | 'api_client';

export type SessionRevokeReason =
  | 'user_logout'
  | 'admin_revoke'
  | 'password_changed'
  | 'suspicious_activity'
  | 'session_limit'
  | 'account_suspended'
  | 'account_anonymized';

export type ConsentPurpose =
  | 'terms_of_service'
  | 'privacy_policy'
  | 'data_processing'
  | 'ai_data_usage'
  | 'marketing_email'
  | 'analytics_tracking'
  | 'third_party_sharing'
  | 'audio_recording'
  | 'screen_capture'
  | 'cookie_analytics'
  | 'cookie_marketing';

export type LegalBasis =
  | 'consent'
  | 'contract'
  | 'legal_obligation'
  | 'legitimate_interest';

export type ConsentCollectionMethod =
  | 'signup_form'
  | 'banner'
  | 'settings'
  | 'prompt'
  | 'api'
  | 'migration';

export type DataAccessAction =
  | 'view'
  | 'export'
  | 'modify'
  | 'delete'
  | 'anonymize'
  | 'share'
  | 'process';

export type AccessorType = 'user' | 'admin' | 'system' | 'api' | 'support';

export type MemberRemovalPolicy = 'anonymize' | 'hard_delete' | 'retain';

export type TenantStatus = 'trial' | 'active' | 'suspended' | 'cancelled';

// ── Permission Structures ──

export interface KbPermissions {
  read: boolean;
  write: boolean;
  delete: boolean;
  manage: boolean;
}

export interface TicketPermissions {
  read: boolean;
  write: boolean;
  assign: boolean;
  delete: boolean;
}

export interface AiPermissions {
  chat: boolean;
  configure: boolean;
}

export interface LogPermissions {
  view: boolean;
  export: boolean;
}

export interface TeamPermissions {
  invite: boolean;
  remove: boolean;
  change_role: boolean;
}

export interface BillingPermissions {
  view: boolean;
  manage: boolean;
}

export interface SettingsPermissions {
  view: boolean;
  edit: boolean;
}

export interface FloatingAssistantPermissions {
  use: boolean;
  configure: boolean;
}

export interface Permissions {
  kb: KbPermissions;
  tickets: TicketPermissions;
  ai: AiPermissions;
  logs: LogPermissions;
  team: TeamPermissions;
  billing: BillingPermissions;
  settings: SettingsPermissions;
  floating_assistant: FloatingAssistantPermissions;
}

// ── Notification Settings ──

export interface EmailNotificationSettings {
  enabled: boolean;
  digest: 'realtime' | 'daily' | 'weekly';
  types: string[];
}

export interface DesktopNotificationSettings {
  enabled: boolean;
  sound: boolean;
  types: string[];
}

export interface InAppNotificationSettings {
  enabled: boolean;
  types: string[];
}

export interface NotificationSettings {
  email: EmailNotificationSettings;
  desktop: DesktopNotificationSettings;
  in_app: InAppNotificationSettings;
}

// ── AI Settings ──

export interface AiSettings {
  preferred_provider: string | null;
  preferred_model: string | null;
  auto_suggest: boolean;
  suggestion_language: string;
  show_cost: boolean;
  show_tokens: boolean;
}

// ── Floating Assistant Settings ──

export interface FloatingAssistantShortcuts {
  toggle: string;
  capture: string;
  audio: string;
  quick_input: string;
}

export interface FloatingAssistantSettings {
  side: 'left' | 'right';
  width: number;
  collapsed: boolean;
  always_on_top: boolean;
  opacity: number;
  stealth_mode: boolean;
  shortcuts: FloatingAssistantShortcuts;
}

// ── UI Settings ──

export interface UiSettings {
  sidebar_collapsed: boolean;
  density: 'compact' | 'comfortable' | 'spacious';
  font_size: 'small' | 'medium' | 'large';
  animations: boolean;
  cat_mascot_visible: boolean;
  keyboard_shortcuts_enabled: boolean;
  default_kb_view: 'list' | 'grid' | 'tree';
  default_ticket_view: 'list' | 'kanban' | 'table';
}

// ── Tenant Settings ──

export interface TenantBranding {
  logo_url?: string;
  primary_color?: string;
  company_name_display?: string;
}

export interface TenantSecurity {
  max_sessions_per_user: number;
  password_min_length: number;
  require_mfa: boolean;
}

export interface TenantFeatures {
  floating_assistant: boolean;
  audio_capture: boolean;
  screen_capture: boolean;
}

export interface TenantSettings {
  branding?: TenantBranding;
  security?: TenantSecurity;
  features?: TenantFeatures;
}

// ── Anonymization ──

export interface AnonymizationOptions {
  deleteAiHistory?: boolean;
  notifyUser?: boolean;
}

export interface AnonymizationResult {
  userId: string;
  anonymizedAt: Date;
  fieldsAnonymized: string[];
  credentialsDeleted: boolean;
  sessionsRevoked: boolean;
}

// ── Consent ──

export interface ConsentRecord {
  purpose: ConsentPurpose;
  granted: boolean;
  legalBasis: LegalBasis;
  policyVersion: string;
  createdAt: Date;
}
