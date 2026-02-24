'use client';

import { useEffect } from 'react';
import { useDevTools } from '@/stores/dev-tools.store';
import type { PlanName } from '@/stores/dev-tools.store';

const PLAN_KEYS: Record<string, PlanName> = {
  '1': 'free',
  '2': 'starter',
  '3': 'pro',
  '4': 'enterprise',
};

export function useDevToolsHotkey() {
  const toggle = useDevTools((s) => s.toggle);
  const setPlan = useDevTools((s) => s.setPlan);
  const setRole = useDevTools((s) => s.setRole);
  const resetOverrides = useDevTools((s) => s.resetOverrides);
  const setIsOpen = useDevTools((s) => s.setIsOpen);
  const setActiveSection = useDevTools((s) => s.setActiveSection);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const handler = (e: KeyboardEvent) => {
      if (!e.ctrlKey || !e.shiftKey) return;

      switch (e.key) {
        case 'D':
          // Ctrl+Shift+D — Toggle DevTools
          e.preventDefault();
          toggle();
          break;
        case 'P':
          // Ctrl+Shift+P — Open DevTools on Controls tab (plan section)
          e.preventDefault();
          setActiveSection('controls');
          setIsOpen(true);
          break;
        case 'R':
          // Ctrl+Shift+R — Open DevTools on Controls tab (role section)
          e.preventDefault();
          setActiveSection('controls');
          setIsOpen(true);
          break;
        case '0':
          // Ctrl+Shift+0 — Reset all overrides
          e.preventDefault();
          resetOverrides();
          break;
        default:
          // Ctrl+Shift+1-4 — Set plan
          if (PLAN_KEYS[e.key]) {
            e.preventDefault();
            setPlan(PLAN_KEYS[e.key]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle, setPlan, setRole, resetOverrides, setIsOpen, setActiveSection]);
}
