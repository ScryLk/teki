'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PlanName = 'free' | 'starter' | 'pro' | 'enterprise';
export type UserRole = 'owner' | 'admin' | 'agent' | 'viewer';
export type SeedScenario = 'empty' | 'basic' | 'full' | 'limit';
export type PanelMode = 'floating' | 'drawer' | 'tab';
export type DrawerSide = 'left' | 'right';
export type DevToolsSection =
  | 'controls'
  | 'data'
  | 'inspector'
  | 'events'
  | 'info';

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
  resetOverrides: () => void;
  addAiCallLog: (entry: AiCallLogEntry) => void;
  clearAiCallsLog: () => void;
  addEventLog: (entry: EventLogEntry) => void;
  clearEventLog: () => void;
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
      mockLatency: 0,
      mockAiEnabled: false,
      forceOffline: false,

      showZustandInspector: false,
      showAiCallsLog: false,
      showNetworkLog: false,
      showPlanGates: false,

      aiCallsLog: [],
      eventLog: [],

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
      resetOverrides: () =>
        set({
          planOverride: null,
          roleOverride: null,
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
