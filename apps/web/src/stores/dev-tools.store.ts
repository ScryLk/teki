'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PlanName = 'free' | 'starter' | 'pro' | 'enterprise';
export type UserRole = 'owner' | 'admin' | 'agent' | 'viewer';
export type SeedScenario = 'empty' | 'basic' | 'full' | 'limit';
export type CatState = 'idle' | 'watching' | 'thinking' | 'happy' | 'alert' | 'sleeping';
export type PanelMode = 'floating' | 'drawer' | 'tab';
export type DrawerSide = 'left' | 'right';
export type DevToolsSection =
  | 'controls'
  | 'data'
  | 'inspector'
  | 'events'
  | 'info'
  | 'query_expansion'
  | 'confidence';

export interface AiCallLogEntry {
  id: string;
  timestamp: string;
  provider: string;
  model: string;
  operation: string;
  status: 'success' | 'error';
  latencyMs: number | null;
  tokensIn: number | null;
  tokensOut: number | null;
  cost: number | null;
  error?: string;
}

export interface EventLogEntry {
  id: string;
  timestamp: string;
  category: string;
  event: string;
  detail: string;
}

interface DevToolsState {
  // Panel state
  isOpen: boolean;
  panelMode: PanelMode;
  panelPosition: { x: number; y: number };
  drawerSide: DrawerSide;
  panelWidth: number;
  panelHeight: number;
  activeSection: DevToolsSection;

  // Runtime overrides
  planOverride: PlanName | null;
  roleOverride: UserRole | null;
  catStateOverride: CatState | null;
  catStateLoop: boolean;
  mockLatency: number;
  mockAiEnabled: boolean;
  forceOffline: boolean;

  // Inspectors
  showZustandInspector: boolean;
  showAiCallsLog: boolean;
  showNetworkLog: boolean;
  showPlanGates: boolean;

  // Logs
  aiCallsLog: AiCallLogEntry[];
  eventLog: EventLogEntry[];

  // Query Expansion & Confidence debug data
  lastExpansionResult: unknown | null;
  lastConfidenceResult: unknown | null;
  expansionStats: { l0: number; l1: number; l2: number; l3: number; miss: number };

  // Actions
  toggle: () => void;
  setIsOpen: (open: boolean) => void;
  setPanelMode: (mode: PanelMode) => void;
  setPanelPosition: (pos: { x: number; y: number }) => void;
  setDrawerSide: (side: DrawerSide) => void;
  setPanelWidth: (width: number) => void;
  setPanelHeight: (height: number) => void;
  setActiveSection: (section: DevToolsSection) => void;
  setPlan: (plan: PlanName) => void;
  setRole: (role: UserRole) => void;
  setMockLatency: (ms: number) => void;
  setMockAiEnabled: (enabled: boolean) => void;
  setForceOffline: (offline: boolean) => void;
  setShowPlanGates: (show: boolean) => void;
  setCatState: (state: CatState | null) => void;
  setCatStateLoop: (loop: boolean) => void;
  resetCatState: () => void;
  resetOverrides: () => void;
  addAiCallLog: (entry: AiCallLogEntry) => void;
  clearAiCallsLog: () => void;
  addEventLog: (entry: EventLogEntry) => void;
  clearEventLog: () => void;
  setLastExpansionResult: (result: unknown) => void;
  setLastConfidenceResult: (result: unknown) => void;
  incrementExpansionStat: (layer: 'l0' | 'l1' | 'l2' | 'l3' | 'miss') => void;
  resetExpansionStats: () => void;
}

export const useDevTools = create<DevToolsState>()(
  persist(
    (set) => ({
      isOpen: false,
      panelMode: 'floating',
      panelPosition: { x: 20, y: 100 },
      drawerSide: 'right',
      panelWidth: 420,
      panelHeight: 520,
      activeSection: 'controls',

      planOverride: null,
      roleOverride: null,
      catStateOverride: null,
      catStateLoop: false,
      mockLatency: 0,
      mockAiEnabled: false,
      forceOffline: false,

      showZustandInspector: false,
      showAiCallsLog: false,
      showNetworkLog: false,
      showPlanGates: false,

      aiCallsLog: [],
      eventLog: [],
      lastExpansionResult: null,
      lastConfidenceResult: null,
      expansionStats: { l0: 0, l1: 0, l2: 0, l3: 0, miss: 0 },

      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      setIsOpen: (open) => set({ isOpen: open }),
      setPanelMode: (mode) => set({ panelMode: mode }),
      setPanelPosition: (pos) => set({ panelPosition: pos }),
      setDrawerSide: (side) => set({ drawerSide: side }),
      setPanelWidth: (width) => set({ panelWidth: width }),
      setPanelHeight: (height) => set({ panelHeight: height }),
      setActiveSection: (section) => set({ activeSection: section }),
      setPlan: (plan) => set({ planOverride: plan }),
      setRole: (role) => set({ roleOverride: role }),
      setMockLatency: (ms) => set({ mockLatency: ms }),
      setMockAiEnabled: (enabled) => set({ mockAiEnabled: enabled }),
      setForceOffline: (offline) => set({ forceOffline: offline }),
      setShowPlanGates: (show) => set({ showPlanGates: show }),
      setCatState: (state) => set({ catStateOverride: state }),
      setCatStateLoop: (loop) => set({ catStateLoop: loop }),
      resetCatState: () => set({ catStateOverride: null, catStateLoop: false }),
      resetOverrides: () =>
        set({
          planOverride: null,
          roleOverride: null,
          catStateOverride: null,
          catStateLoop: false,
          mockLatency: 0,
          mockAiEnabled: false,
          forceOffline: false,
        }),
      addAiCallLog: (entry) =>
        set((s) => ({
          aiCallsLog: [entry, ...s.aiCallsLog].slice(0, 50),
        })),
      clearAiCallsLog: () => set({ aiCallsLog: [] }),
      addEventLog: (entry) =>
        set((s) => ({
          eventLog: [entry, ...s.eventLog].slice(0, 100),
        })),
      clearEventLog: () => set({ eventLog: [] }),
      setLastExpansionResult: (result) => set({ lastExpansionResult: result }),
      setLastConfidenceResult: (result) => set({ lastConfidenceResult: result }),
      incrementExpansionStat: (layer) =>
        set((s) => ({
          expansionStats: {
            ...s.expansionStats,
            [layer]: s.expansionStats[layer] + 1,
          },
        })),
      resetExpansionStats: () =>
        set({ expansionStats: { l0: 0, l1: 0, l2: 0, l3: 0, miss: 0 } }),
    }),
    {
      name: 'teki-devtools',
      partialize: (state) => ({
        panelMode: state.panelMode,
        panelPosition: state.panelPosition,
        drawerSide: state.drawerSide,
        panelWidth: state.panelWidth,
        panelHeight: state.panelHeight,
        activeSection: state.activeSection,
        showPlanGates: state.showPlanGates,
      }),
    }
  )
);
