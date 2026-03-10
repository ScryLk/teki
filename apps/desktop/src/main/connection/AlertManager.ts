import { EventEmitter } from 'events';
import { Notification } from 'electron';
import type { PingResult, AlertEvent } from '@teki/shared';

type AlertState = 'ok' | 'suspicious' | 'alerted' | 'recovering';

interface ServiceAlertState {
  state: AlertState;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  lastAlertAt: number;
  serviceName: string;
}

const FAILURES_TO_ALERT = 3;
const SUCCESSES_TO_RECOVER = 3;
const COOLDOWN_MS = 5 * 60 * 1000; // 5min

export class AlertManager extends EventEmitter {
  private states = new Map<string, ServiceAlertState>();
  private pendingAlerts: AlertEvent[] = [];
  private batchTimer: ReturnType<typeof setTimeout> | null = null;

  registerService(serviceId: string, serviceName: string): void {
    if (!this.states.has(serviceId)) {
      this.states.set(serviceId, {
        state: 'ok',
        consecutiveFailures: 0,
        consecutiveSuccesses: 0,
        lastAlertAt: 0,
        serviceName,
      });
    }
  }

  unregisterService(serviceId: string): void {
    this.states.delete(serviceId);
  }

  evaluate(result: PingResult): void {
    let svc = this.states.get(result.serviceId);
    if (!svc) {
      svc = {
        state: 'ok',
        consecutiveFailures: 0,
        consecutiveSuccesses: 0,
        lastAlertAt: 0,
        serviceName: result.serviceId,
      };
      this.states.set(result.serviceId, svc);
    }

    const isDown = result.status === 'offline';

    if (isDown) {
      svc.consecutiveFailures++;
      svc.consecutiveSuccesses = 0;

      switch (svc.state) {
        case 'ok':
          svc.state = 'suspicious';
          break;
        case 'suspicious':
          if (svc.consecutiveFailures >= FAILURES_TO_ALERT) {
            svc.state = 'alerted';
            this.enqueueAlert(result, svc, 'critical');
          }
          break;
        case 'recovering':
          svc.state = 'alerted';
          // Only alert again if cooldown passed
          if (Date.now() - svc.lastAlertAt > COOLDOWN_MS) {
            this.enqueueAlert(result, svc, 'critical');
          }
          break;
        case 'alerted':
          // Already alerted, respect cooldown
          break;
      }
    } else {
      svc.consecutiveSuccesses++;
      svc.consecutiveFailures = 0;

      switch (svc.state) {
        case 'suspicious':
          svc.state = 'ok';
          break;
        case 'alerted':
          svc.state = 'recovering';
          break;
        case 'recovering':
          if (svc.consecutiveSuccesses >= SUCCESSES_TO_RECOVER) {
            svc.state = 'ok';
            this.enqueueAlert(result, svc, 'resolved');
          }
          break;
        case 'ok':
          break;
      }
    }
  }

  private enqueueAlert(result: PingResult, svc: ServiceAlertState, severity: 'critical' | 'resolved'): void {
    svc.lastAlertAt = Date.now();

    const alert: AlertEvent = {
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      serviceId: result.serviceId,
      serviceName: svc.serviceName,
      severity,
      status: result.status,
      message: severity === 'resolved'
        ? `${svc.serviceName} voltou ao normal`
        : `${svc.serviceName} está offline`,
      timestamp: Date.now(),
      grouped: false,
    };

    this.pendingAlerts.push(alert);

    // Batch alerts within 2s window for grouping
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.flushAlerts(), 2000);
    }
  }

  private flushAlerts(): void {
    this.batchTimer = null;
    const alerts = this.pendingAlerts.splice(0);

    if (alerts.length === 0) return;

    // Group if multiple critical alerts
    const criticals = alerts.filter((a) => a.severity === 'critical');
    const resolved = alerts.filter((a) => a.severity === 'resolved');

    if (criticals.length > 1) {
      const grouped: AlertEvent = {
        id: `alert_group_${Date.now()}`,
        serviceId: 'multiple',
        serviceName: criticals.map((a) => a.serviceName).join(', '),
        severity: 'critical',
        status: 'offline',
        message: `${criticals.length} serviços estão offline: ${criticals.map((a) => a.serviceName).join(', ')}`,
        timestamp: Date.now(),
        grouped: true,
      };
      this.notify(grouped);
      this.emit('alert', grouped);
    } else {
      for (const alert of criticals) {
        this.notify(alert);
        this.emit('alert', alert);
      }
    }

    for (const alert of resolved) {
      this.notify(alert);
      this.emit('alert', alert);
    }
  }

  private notify(alert: AlertEvent): void {
    if (!Notification.isSupported()) return;

    const n = new Notification({
      title: alert.severity === 'resolved'
        ? 'Serviço recuperado'
        : alert.grouped
          ? 'Múltiplos serviços offline'
          : 'Serviço offline',
      body: alert.message,
      urgency: alert.severity === 'critical' ? 'critical' : 'normal',
    });
    n.show();
  }
}

// Singleton
let instance: AlertManager | null = null;

export function getAlertManager(): AlertManager {
  if (!instance) {
    instance = new AlertManager();
  }
  return instance;
}
