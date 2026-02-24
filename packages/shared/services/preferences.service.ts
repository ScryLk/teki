import type {
  Theme,
  NotificationSettings,
  AiSettings,
  FloatingAssistantSettings,
  UiSettings,
} from '../types/user';

// ═══════════════════════════════════════════════════════════════
// Preference Resolution Service
//
// Priority: tenant-specific > global > default
// If the user has a pref for tenant X, use it.
// Otherwise, fall back to the user's global pref.
// Otherwise, use the schema default.
// ═══════════════════════════════════════════════════════════════

export interface UserPreferenceRecord {
  timezone: string;
  timezoneAutoDetected: boolean;
  locale: string;
  theme: Theme;
  notificationSettings: NotificationSettings;
  aiSettings: AiSettings;
  floatingAssistantSettings: FloatingAssistantSettings;
  uiSettings: UiSettings;
  customSettings: Record<string, unknown>;
}

/**
 * Default preference values matching the Prisma schema defaults.
 */
export const DEFAULT_PREFERENCES: UserPreferenceRecord = {
  timezone: 'America/Sao_Paulo',
  timezoneAutoDetected: true,
  locale: 'pt-BR',
  theme: 'dark',
  notificationSettings: {
    email: {
      enabled: true,
      digest: 'daily',
      types: ['ticket_assigned', 'ticket_resolved', 'mention'],
    },
    desktop: {
      enabled: true,
      sound: true,
      types: ['ticket_assigned', 'new_message', 'alert'],
    },
    in_app: {
      enabled: true,
      types: ['all'],
    },
  },
  aiSettings: {
    preferred_provider: null,
    preferred_model: null,
    auto_suggest: true,
    suggestion_language: 'pt-BR',
    show_cost: true,
    show_tokens: false,
  },
  floatingAssistantSettings: {
    side: 'right',
    width: 320,
    collapsed: false,
    always_on_top: true,
    opacity: 0.85,
    stealth_mode: true,
    shortcuts: {
      toggle: 'CommandOrControl+Shift+Space',
      capture: 'CommandOrControl+Shift+S',
      audio: 'CommandOrControl+Shift+A',
      quick_input: 'CommandOrControl+Shift+Q',
    },
  },
  uiSettings: {
    sidebar_collapsed: false,
    density: 'comfortable',
    font_size: 'medium',
    animations: true,
    cat_mascot_visible: true,
    keyboard_shortcuts_enabled: true,
    default_kb_view: 'list',
    default_ticket_view: 'kanban',
  },
  customSettings: {},
};

/**
 * Resolve a single preference key with fallback chain:
 * tenant-specific -> global -> default
 */
export function resolvePreference<K extends keyof UserPreferenceRecord>(
  key: K,
  tenantPref: Partial<UserPreferenceRecord> | null | undefined,
  globalPref: Partial<UserPreferenceRecord> | null | undefined
): UserPreferenceRecord[K] {
  // 1. Tenant-specific preference
  if (tenantPref && tenantPref[key] != null) {
    return tenantPref[key] as UserPreferenceRecord[K];
  }

  // 2. Global user preference (tenant_id = NULL)
  if (globalPref && globalPref[key] != null) {
    return globalPref[key] as UserPreferenceRecord[K];
  }

  // 3. Schema default
  return DEFAULT_PREFERENCES[key];
}

/**
 * Resolve all preferences at once with fallback chain.
 */
export function resolveAllPreferences(
  tenantPref: Partial<UserPreferenceRecord> | null | undefined,
  globalPref: Partial<UserPreferenceRecord> | null | undefined
): UserPreferenceRecord {
  const keys = Object.keys(DEFAULT_PREFERENCES) as (keyof UserPreferenceRecord)[];
  const result = {} as UserPreferenceRecord;

  for (const key of keys) {
    (result as unknown as Record<string, unknown>)[key] = resolvePreference(key, tenantPref, globalPref);
  }

  return result;
}
