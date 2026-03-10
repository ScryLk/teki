import type { HourlyAggregate, DetectedPattern, MonitoredService } from '@teki/shared';
import { getHistoryStore } from './HistoryStore';

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MIN_WEEKS = 3;
const ANOMALY_MULTIPLIER = 2;

interface SlotStats {
  values: number[];
  avg: number;
}

export class PatternDetector {
  private timer: ReturnType<typeof setInterval> | null = null;

  start(): void {
    // Run once on startup (after 1 min delay to let data settle)
    setTimeout(() => this.run(), 60_000);

    // Then daily at 3 AM
    const msUntil3AM = this.msUntilHour(3);
    setTimeout(() => {
      this.run();
      this.timer = setInterval(() => this.run(), 24 * 3600_000);
    }, msUntil3AM);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  run(): void {
    const store = getHistoryStore();
    const services = store.listServices();
    const threeWeeksAgo = Date.now() - MIN_WEEKS * 7 * 24 * 3600_000;
    const allHourly = store.getAllHourly(threeWeeksAgo);

    const allPatterns: DetectedPattern[] = [];

    for (const service of services) {
      const serviceHourly = allHourly.filter((h) => h.serviceId === service.id);
      if (serviceHourly.length === 0) continue;

      const patterns = this.detectForService(service, serviceHourly);
      allPatterns.push(...patterns);
    }

    store.savePatterns(allPatterns);
    console.log(`[PatternDetector] Detected ${allPatterns.length} patterns across ${services.length} services`);
  }

  private detectForService(service: MonitoredService, hourlyData: HourlyAggregate[]): DetectedPattern[] {
    // Build weekly profile: 7 days × 24 hours = 168 slots
    const slots = new Map<string, SlotStats>();

    for (const row of hourlyData) {
      const d = new Date(row.hourStart);
      const key = `${d.getDay()}-${d.getHours()}`;

      if (!slots.has(key)) {
        slots.set(key, { values: [], avg: 0 });
      }
      slots.get(key)!.values.push(row.avgLatency);
    }

    // Calculate slot averages
    for (const stats of slots.values()) {
      stats.avg = stats.values.reduce((a, b) => a + b, 0) / stats.values.length;
    }

    // Calculate overall average latency
    let totalLatency = 0;
    let totalCount = 0;
    for (const stats of slots.values()) {
      totalLatency += stats.avg * stats.values.length;
      totalCount += stats.values.length;
    }
    const overallAvg = totalCount > 0 ? totalLatency / totalCount : 0;

    if (overallAvg === 0) return [];

    // Detect anomalous slots
    const patterns: DetectedPattern[] = [];

    for (const [key, stats] of slots) {
      if (stats.values.length < MIN_WEEKS) continue;
      if (stats.avg <= overallAvg * ANOMALY_MULTIPLIER) continue;

      const [dayStr, hourStr] = key.split('-');
      const dayIndex = parseInt(dayStr, 10);
      const hour = parseInt(hourStr, 10);
      const multiplier = stats.avg / overallAvg;

      patterns.push({
        serviceId: service.id,
        serviceName: service.name,
        dayOfWeek: DAY_NAMES[dayIndex],
        hour,
        avgLatency: Math.round(stats.avg),
        baselineLatency: Math.round(overallAvg),
        severity: multiplier >= 5 ? 'high' : 'medium',
        message: `${DAY_NAMES[dayIndex]} às ${hour}h: latência ${Math.round(stats.avg)}ms (${multiplier.toFixed(1)}x acima do normal de ${Math.round(overallAvg)}ms)`,
        detectedAt: Date.now(),
      });
    }

    return patterns;
  }

  private msUntilHour(targetHour: number): number {
    const now = new Date();
    const target = new Date(now);
    target.setHours(targetHour, 0, 0, 0);
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    return target.getTime() - now.getTime();
  }
}

// Singleton
let instance: PatternDetector | null = null;

export function getPatternDetector(): PatternDetector {
  if (!instance) {
    instance = new PatternDetector();
  }
  return instance;
}
