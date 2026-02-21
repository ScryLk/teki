// Settings types and plan constants for Teki

export interface Plan {
  id: 'free' | 'starter' | 'pro' | 'enterprise';
  name: string;
  price: number;
  mercadoPagoPreapprovalId?: string;
  limits: {
    agents: number;
    messagesPerMonth: number;
    documentsPerAgent: number;
    kbSizeMB: number;
    models: string[];
    conversationRetentionDays: number; // -1 = unlimited
  };
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    limits: {
      agents: 1,
      messagesPerMonth: 50,
      documentsPerAgent: 2,
      kbSizeMB: 5,
      models: ['claude-haiku-4-5-20251001'],
      conversationRetentionDays: 7,
    },
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    mercadoPagoPreapprovalId: 'PREAPPROVAL_STARTER_ID',
    limits: {
      agents: 1,
      messagesPerMonth: 500,
      documentsPerAgent: 5,
      kbSizeMB: 25,
      models: ['claude-haiku-4-5-20251001'],
      conversationRetentionDays: 30,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    mercadoPagoPreapprovalId: 'PREAPPROVAL_PRO_ID',
    limits: {
      agents: 5,
      messagesPerMonth: 2000,
      documentsPerAgent: 50,
      kbSizeMB: 100,
      models: ['claude-haiku-4-5-20251001', 'claude-sonnet-4-5-20250929'],
      conversationRetentionDays: -1,
    },
  },
];

export interface UserSettings {
  // Appearance
  theme: 'dark' | 'light' | 'system';
  accentColor: 'teal' | 'blue' | 'purple' | 'green';
  fontSize: number;
  showTimestamps: boolean;
  showSourceBadges: boolean;
  renderMarkdown: boolean;

  // Cat mascot
  showCat: boolean;
  catSize: 'small' | 'medium' | 'large';
  catAnimations: boolean;

  // AI
  defaultModel: string;
  defaultTemperature: number;
  defaultMaxTokens: number;
  responseLanguage: string;
  includeSourcesInChat: boolean;

  // Desktop
  launchOnStartup: boolean;
  minimizeToTray: boolean;
  showTrayIcon: boolean;
  captureQuality: 'low' | 'medium' | 'high';
  autoContextScreenshot: boolean;
  rememberLastWindow: boolean;
  globalShortcut: string;

  // Notifications
  soundOnResponse: boolean;
  notifyNewMessage: boolean;
  notifyWindowClosed: boolean;
  notifyCaptureError: boolean;
  notifyLimitWarning: boolean;
  notifyRenewal: boolean;
  notifyPaymentFailed: boolean;

  // Privacy
  saveHistory: boolean;
  saveScreenshots: boolean;
  screenshotRetention: '1d' | '7d' | '30d' | 'forever';
  screenshotPath: string;
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  accentColor: 'teal',
  fontSize: 14,
  showTimestamps: true,
  showSourceBadges: true,
  renderMarkdown: true,

  showCat: true,
  catSize: 'medium',
  catAnimations: true,

  defaultModel: 'claude-haiku-4-5-20251001',
  defaultTemperature: 0.7,
  defaultMaxTokens: 2048,
  responseLanguage: 'pt-BR',
  includeSourcesInChat: true,

  launchOnStartup: false,
  minimizeToTray: true,
  showTrayIcon: true,
  captureQuality: 'medium',
  autoContextScreenshot: true,
  rememberLastWindow: true,
  globalShortcut: 'CommandOrControl+Shift+T',

  soundOnResponse: true,
  notifyNewMessage: true,
  notifyWindowClosed: true,
  notifyCaptureError: true,
  notifyLimitWarning: true,
  notifyRenewal: true,
  notifyPaymentFailed: true,

  saveHistory: true,
  saveScreenshots: false,
  screenshotRetention: '7d',
  screenshotPath: '~/Teki/Screenshots',
};

export type SettingsSection =
  | 'conta'
  | 'plano'
  | 'minha-ia'
  | 'aparencia'
  | 'desktop'
  | 'notificacoes'
  | 'privacidade';
