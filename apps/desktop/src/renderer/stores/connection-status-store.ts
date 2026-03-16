import { create } from 'zustand';

export type ConnectionType = 'openclaw' | 'ai';
export type StatusValue = 'online' | 'offline' | 'warning' | 'unconfigured';

export interface StatusDataPoint {
  connectionId: string;
  connectionType: ConnectionType;
  status: StatusValue;
  latencyMs: number | null;
  timestamp: number;
}

export interface ConnectionEntry {
  id: string;
  name: string;
  type: ConnectionType;
  color: string;
  currentStatus: StatusValue;
  currentLatencyMs: number | null;
  history: StatusDataPoint[];
}

const MAX_HISTORY = 120;

interface ConnectionStatusState {
  connections: Record<string, ConnectionEntry>;
  upsertConnection: (entry: Omit<ConnectionEntry, 'history'>) => void;
  addDataPoint: (point: StatusDataPoint) => void;
}

export const useConnectionStatusStore = create<ConnectionStatusState>((set) => ({
  connections: {},

  upsertConnection: (entry) =>
    set((state) => {
      const existing = state.connections[entry.id];
      return {
        connections: {
          ...state.connections,
          [entry.id]: { ...entry, history: existing?.history ?? [] },
        },
      };
    }),

  addDataPoint: (point) =>
    set((state) => {
      const conn = state.connections[point.connectionId];
      if (!conn) return state;
      const history = [...conn.history, point].slice(-MAX_HISTORY);
      return {
        connections: {
          ...state.connections,
          [point.connectionId]: {
            ...conn,
            currentStatus: point.status,
            currentLatencyMs: point.latencyMs,
            history,
          },
        },
      };
    }),
}));
