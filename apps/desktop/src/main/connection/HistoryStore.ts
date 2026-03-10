import Database from 'better-sqlite3';
import { app } from 'electron';
import { join } from 'path';
import type {
  MonitoredService, PingResult, PingHistoryQuery,
  HourlyAggregate, ServiceStats,
} from '@teki/shared';

const RAW_RETENTION_MS = 24 * 60 * 60 * 1000;       // 24h
const HOURLY_RETENTION_MS = 90 * 24 * 60 * 60 * 1000; // 90d
const COMPACT_INTERVAL_MS = 60 * 60 * 1000;          // 1h

export class HistoryStore {
  private db: Database.Database;
  private compactTimer: ReturnType<typeof setInterval> | null = null;

  constructor(dbPath?: string) {
    const path = dbPath || join(app.getPath('userData'), 'monitor.db');
    this.db = new Database(path);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.migrate();
  }

  private migrate(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS monitored_services (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        target TEXT NOT NULL,
        interval_ms INTEGER NOT NULL DEFAULT 30000,
        enabled INTEGER NOT NULL DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS ping_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        status TEXT NOT NULL,
        latency_ms REAL NOT NULL,
        error_message TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_ping_service_time
        ON ping_history(service_id, timestamp);

      CREATE TABLE IF NOT EXISTS ping_hourly (
        service_id TEXT NOT NULL,
        hour_start INTEGER NOT NULL,
        avg_latency REAL,
        p95_latency REAL,
        min_latency REAL,
        max_latency REAL,
        check_count INTEGER,
        fail_count INTEGER,
        uptime_pct REAL,
        PRIMARY KEY (service_id, hour_start)
      );

      CREATE TABLE IF NOT EXISTS detected_patterns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id TEXT NOT NULL,
        service_name TEXT NOT NULL,
        day_of_week TEXT NOT NULL,
        hour INTEGER NOT NULL,
        avg_latency REAL NOT NULL,
        baseline_latency REAL NOT NULL,
        severity TEXT NOT NULL,
        message TEXT NOT NULL,
        detected_at INTEGER NOT NULL
      );
    `);
  }

  // ─── Services CRUD ─────────────────────────────────────────────────────────

  listServices(): MonitoredService[] {
    return this.db.prepare(`
      SELECT id, name, type, target, interval_ms AS intervalMs, enabled
      FROM monitored_services
    `).all().map((row: any) => ({
      ...row,
      enabled: !!row.enabled,
    })) as MonitoredService[];
  }

  addService(service: Omit<MonitoredService, 'id'>): MonitoredService {
    const id = `svc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.db.prepare(`
      INSERT INTO monitored_services (id, name, type, target, interval_ms, enabled)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, service.name, service.type, service.target, service.intervalMs, service.enabled ? 1 : 0);
    return { id, ...service };
  }

  updateService(service: MonitoredService): void {
    this.db.prepare(`
      UPDATE monitored_services
      SET name = ?, type = ?, target = ?, interval_ms = ?, enabled = ?
      WHERE id = ?
    `).run(service.name, service.type, service.target, service.intervalMs, service.enabled ? 1 : 0, service.id);
  }

  removeService(serviceId: string): void {
    this.db.prepare('DELETE FROM monitored_services WHERE id = ?').run(serviceId);
    this.db.prepare('DELETE FROM ping_history WHERE service_id = ?').run(serviceId);
    this.db.prepare('DELETE FROM ping_hourly WHERE service_id = ?').run(serviceId);
    this.db.prepare('DELETE FROM detected_patterns WHERE service_id = ?').run(serviceId);
  }

  // ─── Ping History ──────────────────────────────────────────────────────────

  insertPing(result: PingResult): void {
    this.db.prepare(`
      INSERT INTO ping_history (service_id, timestamp, status, latency_ms, error_message)
      VALUES (?, ?, ?, ?, ?)
    `).run(result.serviceId, result.timestamp, result.status, result.latencyMs, result.error || null);
  }

  queryHistory(query: PingHistoryQuery): PingResult[] {
    return this.db.prepare(`
      SELECT service_id AS serviceId, timestamp, status, latency_ms AS latencyMs, error_message AS error
      FROM ping_history
      WHERE service_id = ? AND timestamp >= ? AND timestamp <= ?
      ORDER BY timestamp ASC
    `).all(query.serviceId, query.from, query.to) as PingResult[];
  }

  queryHourly(query: PingHistoryQuery): HourlyAggregate[] {
    return this.db.prepare(`
      SELECT service_id AS serviceId, hour_start AS hourStart,
             avg_latency AS avgLatency, p95_latency AS p95Latency,
             min_latency AS minLatency, max_latency AS maxLatency,
             check_count AS checkCount, fail_count AS failCount,
             uptime_pct AS uptimePct
      FROM ping_hourly
      WHERE service_id = ? AND hour_start >= ? AND hour_start <= ?
      ORDER BY hour_start ASC
    `).all(query.serviceId, query.from, query.to) as HourlyAggregate[];
  }

  getStats(serviceId: string, periodMs: number): ServiceStats {
    const from = Date.now() - periodMs;
    const row = this.db.prepare(`
      SELECT
        COUNT(*) AS totalChecks,
        SUM(CASE WHEN status = 'offline' THEN 1 ELSE 0 END) AS totalFailures,
        AVG(latency_ms) AS avgLatency
      FROM ping_history
      WHERE service_id = ? AND timestamp >= ?
    `).get(serviceId, from) as any;

    // P95 via sorted latencies
    const latencies = this.db.prepare(`
      SELECT latency_ms FROM ping_history
      WHERE service_id = ? AND timestamp >= ?
      ORDER BY latency_ms ASC
    `).all(serviceId, from) as any[];

    const p95Index = Math.floor(latencies.length * 0.95);
    const p95 = latencies.length > 0 ? latencies[Math.min(p95Index, latencies.length - 1)].latency_ms : 0;

    const totalChecks = row?.totalChecks || 0;
    const totalFailures = row?.totalFailures || 0;

    return {
      serviceId,
      period: `${periodMs}ms`,
      avgLatency: row?.avgLatency || 0,
      p95Latency: p95,
      uptimePct: totalChecks > 0 ? ((totalChecks - totalFailures) / totalChecks) * 100 : 100,
      totalChecks,
      totalFailures,
    };
  }

  // ─── Compaction ────────────────────────────────────────────────────────────

  compact(): void {
    const now = Date.now();
    const oneHourAgo = now - 3600_000;

    // Get distinct service+hour combos that need aggregation
    const hours = this.db.prepare(`
      SELECT DISTINCT service_id, (timestamp / 3600000) * 3600000 AS hour_start
      FROM ping_history
      WHERE timestamp < ?
    `).all(oneHourAgo) as any[];

    const upsert = this.db.prepare(`
      INSERT OR REPLACE INTO ping_hourly
        (service_id, hour_start, avg_latency, p95_latency, min_latency, max_latency, check_count, fail_count, uptime_pct)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const queryHour = this.db.prepare(`
      SELECT latency_ms, status FROM ping_history
      WHERE service_id = ? AND timestamp >= ? AND timestamp < ?
      ORDER BY latency_ms ASC
    `);

    const tx = this.db.transaction(() => {
      for (const { service_id, hour_start } of hours) {
        const pings = queryHour.all(service_id, hour_start, hour_start + 3600_000) as any[];
        if (pings.length === 0) continue;

        const latencies = pings.map((p) => p.latency_ms);
        const fails = pings.filter((p) => p.status === 'offline').length;
        const p95Index = Math.floor(latencies.length * 0.95);

        upsert.run(
          service_id,
          hour_start,
          latencies.reduce((a, b) => a + b, 0) / latencies.length,
          latencies[Math.min(p95Index, latencies.length - 1)],
          Math.min(...latencies),
          Math.max(...latencies),
          pings.length,
          fails,
          ((pings.length - fails) / pings.length) * 100,
        );
      }

      // Delete raw pings older than 24h
      this.db.prepare('DELETE FROM ping_history WHERE timestamp < ?').run(now - RAW_RETENTION_MS);
      // Delete hourly older than 90d
      this.db.prepare('DELETE FROM ping_hourly WHERE hour_start < ?').run(now - HOURLY_RETENTION_MS);
    });

    tx();
  }

  startCompaction(): void {
    this.compact();
    this.compactTimer = setInterval(() => this.compact(), COMPACT_INTERVAL_MS);
  }

  // ─── Patterns ──────────────────────────────────────────────────────────────

  savePatterns(patterns: import('@teki/shared').DetectedPattern[]): void {
    const now = Date.now();
    this.db.prepare('DELETE FROM detected_patterns').run();
    const insert = this.db.prepare(`
      INSERT INTO detected_patterns (service_id, service_name, day_of_week, hour, avg_latency, baseline_latency, severity, message, detected_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const tx = this.db.transaction(() => {
      for (const p of patterns) {
        insert.run(p.serviceId, p.serviceName, p.dayOfWeek, p.hour, p.avgLatency, p.baselineLatency, p.severity, p.message, now);
      }
    });
    tx();
  }

  getPatterns(): import('@teki/shared').DetectedPattern[] {
    return this.db.prepare(`
      SELECT service_id AS serviceId, service_name AS serviceName,
             day_of_week AS dayOfWeek, hour, avg_latency AS avgLatency,
             baseline_latency AS baselineLatency, severity, message,
             detected_at AS detectedAt
      FROM detected_patterns
      ORDER BY severity DESC, service_id
    `).all() as import('@teki/shared').DetectedPattern[];
  }

  // ─── Hourly data for pattern detection ─────────────────────────────────────

  getAllHourly(fromMs: number): HourlyAggregate[] {
    return this.db.prepare(`
      SELECT service_id AS serviceId, hour_start AS hourStart,
             avg_latency AS avgLatency, p95_latency AS p95Latency,
             min_latency AS minLatency, max_latency AS maxLatency,
             check_count AS checkCount, fail_count AS failCount,
             uptime_pct AS uptimePct
      FROM ping_hourly
      WHERE hour_start >= ?
      ORDER BY hour_start ASC
    `).all(fromMs) as HourlyAggregate[];
  }

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  close(): void {
    if (this.compactTimer) {
      clearInterval(this.compactTimer);
      this.compactTimer = null;
    }
    this.db.close();
  }
}

// Singleton
let instance: HistoryStore | null = null;

export function getHistoryStore(): HistoryStore {
  if (!instance) {
    instance = new HistoryStore();
  }
  return instance;
}
