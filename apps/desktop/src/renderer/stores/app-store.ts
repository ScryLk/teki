import { create } from 'zustand';

export type LayoutMode = 'split' | 'chat-only' | 'screen-only' | 'compact';

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

  // Full-page settings
  settingsPageOpen: boolean;

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

  // AI model selection
  selectedModel: string;

  // Actions
  setLayout: (layout: LayoutMode) => void;
  toggleCommandPalette: () => void;
  setSettingsOpen: (open: boolean) => void;
  setSettingsPageOpen: (open: boolean) => void;
  setWatching: (isWatching: boolean, windowName?: string) => void;
  setCatState: (catState: CatState) => void;
  setActiveWindow: (activeWindow: ActiveWindowInfo | null) => void;
  setCurrentFrame: (frame: string | null) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setSelectedModel: (model: string) => void;
  requestWindowSelector: boolean;
  triggerWindowSelector: () => void;
  clearWindowSelector: () => void;
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

  // Full-page settings
  settingsPageOpen: false,

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

  // Window selector trigger
  requestWindowSelector: false,

  // AI model
  selectedModel: getStoredModel(),

  // Actions
  setLayout: (layout) => set({ layout }),

  toggleCommandPalette: () =>
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),

  setSettingsPageOpen: (settingsPageOpen) => set({ settingsPageOpen }),

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
}));
