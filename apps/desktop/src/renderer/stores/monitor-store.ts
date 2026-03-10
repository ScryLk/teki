import { create } from 'zustand';
import type { MonitoredService, PingResult, AlertEvent, DetectedPattern, ServiceStats } from '@teki/shared';

const MAX_PINGS_PER_SERVICE = 60;

interface MonitorState {
  services: MonitoredService[];
  /** Latest pings per service (max 60 each) */
  pings: Record<string, PingResult[]>;
  alerts: AlertEvent[];
  patterns: DetectedPattern[];
  stats: Record<string, ServiceStats>;

  // Actions
  setServices: (services: MonitoredService[]) => void;
  addService: (service: MonitoredService) => void;
  removeService: (serviceId: string) => void;
  updateService: (service: MonitoredService) => void;
  addPing: (result: PingResult) => void;
  addAlert: (alert: AlertEvent) => void;
  clearAlerts: () => void;
  setPatterns: (patterns: DetectedPattern[]) => void;
  setStats: (serviceId: string, stats: ServiceStats) => void;
}

export const useMonitorStore = create<MonitorState>((set) => ({
  services: [],
  pings: {},
  alerts: [],
  patterns: [],
  stats: {},

  setServices: (services) => set({ services }),

  addService: (service) =>
    set((state) => ({ services: [...state.services, service] })),

  removeService: (serviceId) =>
    set((state) => ({
      services: state.services.filter((s) => s.id !== serviceId),
      pings: Object.fromEntries(
        Object.entries(state.pings).filter(([k]) => k !== serviceId),
      ),
      stats: Object.fromEntries(
        Object.entries(state.stats).filter(([k]) => k !== serviceId),
      ),
    })),

  updateService: (service) =>
    set((state) => ({
      services: state.services.map((s) => (s.id === service.id ? service : s)),
    })),

  addPing: (result) =>
    set((state) => {
      const existing = state.pings[result.serviceId] || [];
      const updated = [...existing, result].slice(-MAX_PINGS_PER_SERVICE);
      return { pings: { ...state.pings, [result.serviceId]: updated } };
    }),

  addAlert: (alert) =>
    set((state) => ({ alerts: [alert, ...state.alerts].slice(0, 50) })),

  clearAlerts: () => set({ alerts: [] }),

  setPatterns: (patterns) => set({ patterns }),

  setStats: (serviceId, stats) =>
    set((state) => ({ stats: { ...state.stats, [serviceId]: stats } })),
}));
