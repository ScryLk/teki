import { useEffect, useRef } from 'react';
import { useMonitorStore } from '@/stores/monitor-store';

export function useMonitor(): void {
  const initialized = useRef(false);
  const setServices = useMonitorStore((s) => s.setServices);
  const addPing = useMonitorStore((s) => s.addPing);
  const addAlert = useMonitorStore((s) => s.addAlert);
  const setPatterns = useMonitorStore((s) => s.setPatterns);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const api = window.tekiAPI;
    if (!api?.monitorListServices) return;

    // Load services
    api.monitorListServices().then(setServices).catch(console.error);

    // Load patterns
    api.monitorGetPatterns().then(setPatterns).catch(console.error);

    // Subscribe to probe results
    const unsubProbe = api.onMonitorProbeResult((result) => {
      addPing(result);
    });

    // Subscribe to alerts
    const unsubAlert = api.onMonitorAlert((alert) => {
      addAlert(alert);
    });

    return () => {
      unsubProbe();
      unsubAlert();
      initialized.current = false;
    };
  }, [setServices, addPing, addAlert, setPatterns]);
}
