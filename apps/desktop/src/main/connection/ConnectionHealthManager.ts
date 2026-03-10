import { EventEmitter } from 'events';
import { net } from 'electron';
import { withTimeout } from '@teki/shared';
import type { ConnectionHealth, ConnectionHealthEvent, ServiceStatus, MonitoredService, PingResult } from '@teki/shared';
import { channelRegistry } from '../openclaw/core/ChannelRegistry';
import { runProbe } from './probes';
import { getHistoryStore } from './HistoryStore';

const POLL_INTERVAL = 30_000;
const BACKEND_TIMEOUT = 5_000;

export class ConnectionHealthManager extends EventEmitter {
  private health: ConnectionHealth = {
    internet: 'checking',
    backend: 'checking',
    openclaw: 'checking',
  };
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private serviceTimers = new Map<string, ReturnType<typeof setInterval>>();
  private backendUrl: string;

  constructor(backendUrl?: string) {
    super();
    this.backendUrl = backendUrl || process.env.TEKI_API_URL || 'https://app.teki.services';
  }

  start(): void {
    this.checkAll();
    this.pollTimer = setInterval(() => this.checkAll(), POLL_INTERVAL);

    // Start probe loops for monitored services
    this.startServiceProbes();

    // Start hourly compaction
    getHistoryStore().startCompaction();
  }

  stop(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    for (const timer of this.serviceTimers.values()) {
      clearInterval(timer);
    }
    this.serviceTimers.clear();
  }

  getHealth(): ConnectionHealth {
    return { ...this.health };
  }

  async checkAll(): Promise<void> {
    await Promise.allSettled([
      this.checkInternet(),
      this.checkBackend(),
      this.checkOpenClaw(),
    ]);

    this.emit('health-changed', {
      health: this.getHealth(),
      timestamp: Date.now(),
    } satisfies ConnectionHealthEvent);
  }

  // ─── Monitored Services ────────────────────────────────────────────────────

  getServices(): MonitoredService[] {
    return getHistoryStore().listServices();
  }

  addService(service: Omit<MonitoredService, 'id'>): MonitoredService {
    const created = getHistoryStore().addService(service);
    if (created.enabled) {
      this.startServiceProbe(created);
    }
    return created;
  }

  updateService(service: MonitoredService): void {
    getHistoryStore().updateService(service);
    // Restart probe with new config
    this.stopServiceProbe(service.id);
    if (service.enabled) {
      this.startServiceProbe(service);
    }
  }

  removeService(serviceId: string): void {
    this.stopServiceProbe(serviceId);
    getHistoryStore().removeService(serviceId);
  }

  async probeNow(serviceId: string): Promise<PingResult> {
    const services = this.getServices();
    const service = services.find((s) => s.id === serviceId);
    if (!service) {
      return {
        serviceId,
        status: 'offline',
        latencyMs: 0,
        timestamp: Date.now(),
        error: 'Service not found',
      };
    }

    const result = await runProbe(service);
    getHistoryStore().insertPing(result);
    this.emit('probe-result', result);
    return result;
  }

  // ─── Private: Service Probe Loops ──────────────────────────────────────────

  private startServiceProbes(): void {
    const services = this.getServices();
    for (const service of services) {
      if (service.enabled) {
        this.startServiceProbe(service);
      }
    }
  }

  private startServiceProbe(service: MonitoredService): void {
    // Run immediately
    this.runServiceProbe(service);

    // Then on interval
    const timer = setInterval(
      () => this.runServiceProbe(service),
      service.intervalMs || POLL_INTERVAL,
    );
    this.serviceTimers.set(service.id, timer);
  }

  private stopServiceProbe(serviceId: string): void {
    const timer = this.serviceTimers.get(serviceId);
    if (timer) {
      clearInterval(timer);
      this.serviceTimers.delete(serviceId);
    }
  }

  private async runServiceProbe(service: MonitoredService): Promise<void> {
    try {
      const result = await runProbe(service);
      getHistoryStore().insertPing(result);
      this.emit('probe-result', result);
    } catch (err) {
      console.error(`[Monitor] Probe failed for ${service.name}:`, err);
    }
  }

  // ─── Private: Core Health Checks ───────────────────────────────────────────

  private async checkInternet(): Promise<void> {
    try {
      const online = net.isOnline();
      this.setServiceStatus('internet', online ? 'online' : 'offline');
    } catch {
      this.setServiceStatus('internet', 'offline');
    }
  }

  private async checkBackend(): Promise<void> {
    if (this.health.internet === 'offline') {
      this.setServiceStatus('backend', 'offline');
      return;
    }

    try {
      const healthUrl = `${this.backendUrl}/api/health`;
      await withTimeout(
        fetch(healthUrl).then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
        }),
        BACKEND_TIMEOUT,
        'backend-health',
      );
      this.setServiceStatus('backend', 'online');
    } catch {
      this.setServiceStatus('backend', 'offline');
    }
  }

  private checkOpenClaw(): void {
    const channels = channelRegistry.listChannels();
    const configured = channels.filter((ch) => ch.status !== 'idle');

    if (configured.length === 0) {
      this.setServiceStatus('openclaw', 'online');
      return;
    }

    const connected = configured.filter((ch) => ch.status === 'connected').length;

    if (connected === configured.length) {
      this.setServiceStatus('openclaw', 'online');
    } else if (connected > 0) {
      this.setServiceStatus('openclaw', 'degraded');
    } else {
      this.setServiceStatus('openclaw', 'offline');
    }
  }

  private setServiceStatus(service: keyof ConnectionHealth, status: ServiceStatus): void {
    this.health[service] = status;
  }
}

// Singleton
let instance: ConnectionHealthManager | null = null;

export function getConnectionHealthManager(backendUrl?: string): ConnectionHealthManager {
  if (!instance) {
    instance = new ConnectionHealthManager(backendUrl);
  }
  return instance;
}
