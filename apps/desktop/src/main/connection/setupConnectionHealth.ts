import { ipcMain, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '@teki/shared';
import type { ConnectionHealthEvent, PingResult, AlertEvent, MonitoredService, PingHistoryQuery } from '@teki/shared';
import { getConnectionHealthManager } from './ConnectionHealthManager';
import { getAlertManager } from './AlertManager';
import { getHistoryStore } from './HistoryStore';
import { getPatternDetector } from './PatternDetector';

export function setupConnectionHealth(mainWindow: BrowserWindow): void {
  const manager = getConnectionHealthManager();
  const alertManager = getAlertManager();
  const historyStore = getHistoryStore();

  // ─── Existing health handlers ──────────────────────────────────────────────

  ipcMain.handle(IPC_CHANNELS.CONNECTION_HEALTH_GET, () => {
    return manager.getHealth();
  });

  manager.on('health-changed', (event: ConnectionHealthEvent) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send(IPC_CHANNELS.CONNECTION_HEALTH_STATUS, event);
    }
  });

  // ─── Monitor: Service CRUD ─────────────────────────────────────────────────

  ipcMain.handle(IPC_CHANNELS.MONITOR_LIST_SERVICES, () => {
    return manager.getServices();
  });

  ipcMain.handle(IPC_CHANNELS.MONITOR_ADD_SERVICE, (_event, service: Omit<MonitoredService, 'id'>) => {
    const created = manager.addService(service);
    alertManager.registerService(created.id, created.name);
    return created;
  });

  ipcMain.handle(IPC_CHANNELS.MONITOR_UPDATE_SERVICE, (_event, service: MonitoredService) => {
    manager.updateService(service);
    alertManager.registerService(service.id, service.name);
  });

  ipcMain.handle(IPC_CHANNELS.MONITOR_REMOVE_SERVICE, (_event, serviceId: string) => {
    manager.removeService(serviceId);
    alertManager.unregisterService(serviceId);
  });

  // ─── Monitor: Probe ────────────────────────────────────────────────────────

  ipcMain.handle(IPC_CHANNELS.MONITOR_PROBE_NOW, (_event, serviceId: string) => {
    return manager.probeNow(serviceId);
  });

  // Push probe results to renderer
  manager.on('probe-result', (result: PingResult) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send(IPC_CHANNELS.MONITOR_PROBE_RESULT, result);
    }
    // Feed into alert manager
    alertManager.evaluate(result);
  });

  // ─── Monitor: History ──────────────────────────────────────────────────────

  ipcMain.handle(IPC_CHANNELS.MONITOR_QUERY_HISTORY, (_event, query: PingHistoryQuery) => {
    return historyStore.queryHistory(query);
  });

  ipcMain.handle(IPC_CHANNELS.MONITOR_QUERY_HOURLY, (_event, query: PingHistoryQuery) => {
    return historyStore.queryHourly(query);
  });

  ipcMain.handle(IPC_CHANNELS.MONITOR_GET_STATS, (_event, serviceId: string, period: string) => {
    const periodMs = parsePeriod(period);
    return historyStore.getStats(serviceId, periodMs);
  });

  // ─── Monitor: Alerts ───────────────────────────────────────────────────────

  alertManager.on('alert', (alert: AlertEvent) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send(IPC_CHANNELS.MONITOR_ALERT, alert);
    }
  });

  // ─── Monitor: Patterns ─────────────────────────────────────────────────────

  ipcMain.handle(IPC_CHANNELS.MONITOR_GET_PATTERNS, () => {
    return historyStore.getPatterns();
  });

  // ─── Register existing services in alert manager ───────────────────────────

  for (const svc of manager.getServices()) {
    alertManager.registerService(svc.id, svc.name);
  }

  // ─── Start monitoring ──────────────────────────────────────────────────────

  manager.start();

  // ─── Start pattern detection ───────────────────────────────────────────────

  getPatternDetector().start();
}

function parsePeriod(period: string): number {
  const match = period.match(/^(\d+)(h|d)$/);
  if (!match) return 24 * 60 * 60 * 1000; // default 24h
  const value = parseInt(match[1], 10);
  const unit = match[2];
  return unit === 'h' ? value * 3600_000 : value * 86400_000;
}
