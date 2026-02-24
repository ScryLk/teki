import { create } from 'zustand';
import type {
  InspectionState,
  InspectionStatus,
  InspectionStats,
  InspectionAlert,
  DetectedSoftware,
} from '@teki/shared';

interface InspectionStore {
  // State
  status: InspectionStatus;
  stats: InspectionStats;
  recentAlerts: InspectionAlert[];
  currentSoftware?: DetectedSoftware;
  inspectorTabOpen: boolean;

  // Actions
  setStatus: (status: InspectionStatus) => void;
  setStats: (stats: InspectionStats) => void;
  setState: (state: InspectionState) => void;
  addAlert: (alert: InspectionAlert) => void;
  dismissAlert: (alertId: string) => void;
  setInspectorTabOpen: (open: boolean) => void;

  // API actions
  startInspection: () => Promise<void>;
  stopInspection: () => Promise<void>;
  pauseInspection: () => Promise<void>;
  resumeInspection: () => Promise<void>;
  refreshState: () => Promise<void>;
}

export const useInspectionStore = create<InspectionStore>((set, get) => ({
  // Initial state
  status: 'stopped',
  stats: {
    framesCaptured: 0,
    framesAnalyzed: 0,
    framesSkipped: 0,
    errorsDetected: 0,
    kbMatchesFound: 0,
    alertsSent: 0,
    visionApiCalls: 0,
    isRunning: false,
    currentInterval: 3000,
  },
  recentAlerts: [],
  currentSoftware: undefined,
  inspectorTabOpen: false,

  // Setters
  setStatus: (status) => set({ status }),

  setStats: (stats) => set({ stats }),

  setState: (state) =>
    set({
      status: state.status,
      stats: state.stats,
      recentAlerts: state.recentAlerts,
      currentSoftware: state.currentSoftware,
    }),

  addAlert: (alert) =>
    set((s) => ({
      recentAlerts: [...s.recentAlerts.slice(-19), alert],
    })),

  dismissAlert: (alertId) =>
    set((s) => ({
      recentAlerts: s.recentAlerts.filter((a) => a.id !== alertId),
    })),

  setInspectorTabOpen: (open) => set({ inspectorTabOpen: open }),

  // API actions
  startInspection: async () => {
    await window.tekiAPI.startInspection();
  },

  stopInspection: async () => {
    await window.tekiAPI.stopInspection();
  },

  pauseInspection: async () => {
    await window.tekiAPI.pauseInspection();
  },

  resumeInspection: async () => {
    await window.tekiAPI.resumeInspection();
  },

  refreshState: async () => {
    const state = await window.tekiAPI.getInspectionState();
    set({
      status: state.status,
      stats: state.stats,
      recentAlerts: state.recentAlerts,
      currentSoftware: state.currentSoftware,
    });
  },
}));
