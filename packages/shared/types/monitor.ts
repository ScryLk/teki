// ─── Probe & Service types ───────────────────────────────────────────────────

export type ProbeType = 'http' | 'tcp' | 'pg';

export interface MonitoredService {
  id: string;
  name: string;
  type: ProbeType;
  /** URL for http, host:port for tcp, connection string for pg */
  target: string;
  /** Polling interval in ms (default 30_000) */
  intervalMs: number;
  enabled: boolean;
}

export interface PingResult {
  serviceId: string;
  status: 'online' | 'degraded' | 'offline';
  latencyMs: number;
  timestamp: number;
  error?: string;
}

// ─── History & Aggregation ───────────────────────────────────────────────────

export interface PingHistoryQuery {
  serviceId: string;
  from: number;
  to: number;
  granularity: 'raw' | 'hourly';
}

export interface HourlyAggregate {
  serviceId: string;
  hourStart: number;
  avgLatency: number;
  p95Latency: number;
  minLatency: number;
  maxLatency: number;
  checkCount: number;
  failCount: number;
  uptimePct: number;
}

export interface ServiceStats {
  serviceId: string;
  period: string;
  avgLatency: number;
  p95Latency: number;
  uptimePct: number;
  totalChecks: number;
  totalFailures: number;
}

// ─── Alerts ──────────────────────────────────────────────────────────────────

export type AlertSeverity = 'warning' | 'critical' | 'resolved';

export interface AlertEvent {
  id: string;
  serviceId: string;
  serviceName: string;
  severity: AlertSeverity;
  status: 'online' | 'degraded' | 'offline';
  message: string;
  timestamp: number;
  grouped: boolean;
}

// ─── Pattern Detection ───────────────────────────────────────────────────────

export interface DetectedPattern {
  serviceId: string;
  serviceName: string;
  dayOfWeek: string;
  hour: number;
  avgLatency: number;
  baselineLatency: number;
  severity: 'medium' | 'high';
  message: string;
  detectedAt: number;
}
