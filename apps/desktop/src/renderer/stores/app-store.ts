import { create } from 'zustand';
import type { ConnectionHealth } from '@teki/shared';
import { DEFAULT_CONNECTION_HEALTH } from '@teki/shared';

export type LayoutMode = 'split' | 'chat-only' | 'screen-only' | 'compact' | 'monitor';

export type CatState = 'idle' | 'watching' | 'thinking' | 'happy' | 'alert' | 'sleeping';

export type ConnectionStatus = 'online' | 'offline';

export interface ActiveWindowInfo {
  title: string;
  processName: string;
}

interface AppState {
  // Layout
  layout: LayoutMode;

  // Command palette
  commandPaletteOpen: boolean;

  // Settings panel
  settingsOpen: boolean;

  // Window watching state
  isWatching: boolean;
  watchedWindowName: string | null;
  currentFrame: string | null;
  watchStartTime: number | null;

  // Cat state
  catState: CatState;

  // Active window (for context)
  activeWindow: ActiveWindowInfo | null;

  // Connection
  connectionStatus: ConnectionStatus;
  connectionHealth: ConnectionHealth;

  // AI model selection
  selectedModel: string;

  // Auth
  isAuthenticated: boolean;
  userEmail: string | null;
  userName: string | null;

  // Actions
  setLayout: (layout: LayoutMode) => void;
  toggleCommandPalette: () => void;
  setSettingsOpen: (open: boolean) => void;
  setWatching: (isWatching: boolean, windowName?: string) => void;
  setCatState: (catState: CatState) => void;
  setActiveWindow: (activeWindow: ActiveWindowInfo | null) => void;
  setCurrentFrame: (frame: string | null) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setConnectionHealth: (health: ConnectionHealth) => void;
  setSelectedModel: (model: string) => void;
  requestWindowSelector: boolean;
  triggerWindowSelector: () => void;
  clearWindowSelector: () => void;

  // Auth actions
  userPlan: string | null;
  setAuth: (isAuthenticated: boolean, email: string | null, name: string | null, plan?: string | null) => void;
  clearAuth: () => void;
}

function getStoredModel(): string {
  try {
    return localStorage.getItem('teki-selected-model') ?? 'gemini-flash';
  } catch {
    return 'gemini-flash';
  }
}

export const useAppStore = create<AppState>((set) => ({
  // Layout
  layout: 'split',

  // Command palette
  commandPaletteOpen: false,

  // Settings panel
  settingsOpen: false,

  // Window watching state
  isWatching: false,
  watchedWindowName: null,
  currentFrame: null,
  watchStartTime: null,

  // Cat state
  catState: 'idle',

  // Active window
  activeWindow: null,

  // Connection
  connectionStatus: 'online',
  connectionHealth: DEFAULT_CONNECTION_HEALTH,

  // Window selector trigger
  requestWindowSelector: false,

  // AI model
  selectedModel: getStoredModel(),

  // Auth
  isAuthenticated: false,
  userEmail: null,
  userName: null,

  // Actions
  setLayout: (layout) => set({ layout }),

  toggleCommandPalette: () =>
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),

  setWatching: (isWatching, windowName) =>
    set((state) => ({
      isWatching,
      watchedWindowName: windowName ?? state.watchedWindowName,
      currentFrame: isWatching ? state.currentFrame : null,
      watchStartTime: isWatching ? (state.isWatching ? state.watchStartTime : Date.now()) : null,
    })),

  setCatState: (catState) => set({ catState }),

  setActiveWindow: (activeWindow) => set({ activeWindow }),

  setCurrentFrame: (currentFrame) => set({ currentFrame }),

  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

  setConnectionHealth: (connectionHealth) => {
    // Derive overall status from health
    const allOnline = connectionHealth.internet === 'online' && connectionHealth.backend === 'online';
    set({ connectionHealth, connectionStatus: allOnline ? 'online' : 'offline' });
  },

  setSelectedModel: (model) => {
    try {
      localStorage.setItem('teki-selected-model', model);
    } catch {
      // ignore
    }
    set({ selectedModel: model });
  },

  triggerWindowSelector: () => set({ requestWindowSelector: true }),
  clearWindowSelector: () => set({ requestWindowSelector: false }),

  // Auth actions
  userPlan: null,
  setAuth: (isAuthenticated, email, name, plan) =>
    set({ isAuthenticated, userEmail: email, userName: name, userPlan: plan ?? null }),
  clearAuth: () =>
    set({ isAuthenticated: false, userEmail: null, userName: null, userPlan: null }),
}));
