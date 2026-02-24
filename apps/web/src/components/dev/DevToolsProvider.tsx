'use client';

import { lazy, Suspense } from 'react';
import { useDevToolsHotkey } from '@/hooks/useDevToolsHotkey';

const DevToolsPanel =
  process.env.NODE_ENV === 'development'
    ? lazy(() => import('./DevToolsPanel'))
    : () => null;

const DevToolsTrigger =
  process.env.NODE_ENV === 'development'
    ? lazy(() => import('./DevToolsTrigger'))
    : () => null;

const QuickPlanBar =
  process.env.NODE_ENV === 'development'
    ? lazy(() => import('./QuickPlanBar'))
    : () => null;

function DevToolsHotkeyListener() {
  useDevToolsHotkey();
  return null;
}

export function DevToolsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev) {
    return <>{children}</>;
  }

  return (
    <>
      <DevToolsHotkeyListener />
      <Suspense fallback={null}>
        <QuickPlanBar />
      </Suspense>
      {children}
      <Suspense fallback={null}>
        <DevToolsTrigger />
        <DevToolsPanel />
      </Suspense>
    </>
  );
}
