import { useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';

export function useConnectionHealth(): void {
  const setConnectionHealth = useAppStore((s) => s.setConnectionHealth);

  useEffect(() => {
    if (!window.tekiAPI?.getConnectionHealth) return;

    // Fetch initial health
    window.tekiAPI.getConnectionHealth().then(setConnectionHealth);

    // Subscribe to updates
    const unsubscribe = window.tekiAPI.onConnectionHealthChange?.((event) => {
      setConnectionHealth(event.health);
    });

    return () => {
      unsubscribe?.();
    };
  }, [setConnectionHealth]);
}
