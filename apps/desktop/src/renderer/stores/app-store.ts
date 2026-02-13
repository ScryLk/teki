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

  // Capture state
  isCapturing: boolean;
  captureInterval: number;
  currentFrame: string | null;

  // Cat state
  catState: CatState;

  // Active window
  activeWindow: ActiveWindowInfo | null;

  // Connection
  connectionStatus: ConnectionStatus;

  // Actions
  setLayout: (layout: LayoutMode) => void;
  toggleCommandPalette: () => void;
  setCaptureState: (isCapturing: boolean, captureInterval?: number) => void;
  setCatState: (catState: CatState) => void;
  setActiveWindow: (activeWindow: ActiveWindowInfo | null) => void;
  setCurrentFrame: (frame: string | null) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Layout
  layout: 'split',

  // Command palette
  commandPaletteOpen: false,

  // Capture state
  isCapturing: false,
  captureInterval: 5,
  currentFrame: null,

  // Cat state
  catState: 'idle',

  // Active window
  activeWindow: null,

  // Connection
  connectionStatus: 'online',

  // Actions
  setLayout: (layout) => set({ layout }),

  toggleCommandPalette: () =>
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

  setCaptureState: (isCapturing, captureInterval) =>
    set((state) => ({
      isCapturing,
      captureInterval: captureInterval ?? state.captureInterval,
    })),

  setCatState: (catState) => set({ catState }),

  setActiveWindow: (activeWindow) => set({ activeWindow }),

  setCurrentFrame: (currentFrame) => set({ currentFrame }),

  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
}));
