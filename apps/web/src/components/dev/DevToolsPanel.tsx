'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDevTools } from '@/stores/dev-tools.store';
import { DevToolsTabs } from './DevToolsTabs';
import { ControlsTab } from './tabs/ControlsTab';
import { DataTab } from './tabs/DataTab';
import { InspectorTab } from './tabs/InspectorTab';
import { EventsTab } from './tabs/EventsTab';
import { InfoTab } from './tabs/InfoTab';

export default function DevToolsPanel() {
  const isOpen = useDevTools((s) => s.isOpen);
  const panelMode = useDevTools((s) => s.panelMode);
  const panelPosition = useDevTools((s) => s.panelPosition);
  const panelWidth = useDevTools((s) => s.panelWidth);
  const panelHeight = useDevTools((s) => s.panelHeight);
  const drawerSide = useDevTools((s) => s.drawerSide);
  const activeSection = useDevTools((s) => s.activeSection);
  const toggle = useDevTools((s) => s.toggle);
  const setPanelPosition = useDevTools((s) => s.setPanelPosition);
  const setPanelMode = useDevTools((s) => s.setPanelMode);

  const panelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (panelMode !== 'floating') return;
      setIsDragging(true);
      dragOffset.current = {
        x: e.clientX - panelPosition.x,
        y: e.clientY - panelPosition.y,
      };
    },
    [panelMode, panelPosition]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPanelPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, setPanelPosition]);

  if (!isOpen) return null;

  const renderContent = () => {
    switch (activeSection) {
      case 'controls':
        return <ControlsTab />;
      case 'data':
        return <DataTab />;
      case 'inspector':
        return <InspectorTab />;
      case 'events':
        return <EventsTab />;
      case 'info':
        return <InfoTab />;
    }
  };

  // Floating mode
  if (panelMode === 'floating') {
    return (
      <div
        ref={panelRef}
        className="fixed z-[9999] flex flex-col rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl"
        style={{
          left: panelPosition.x,
          top: panelPosition.y,
          width: panelWidth,
          maxHeight: panelHeight,
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between border-b border-zinc-700 px-3 py-1.5 cursor-move select-none"
          onMouseDown={handleMouseDown}
        >
          <span className="text-xs font-semibold text-zinc-300">
            Teki DevTools
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPanelMode('drawer')}
              className="rounded p-0.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
              title="Switch to drawer mode"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="15" y1="3" x2="15" y2="21" />
              </svg>
            </button>
            <button
              onClick={() => setPanelMode('tab')}
              className="rounded p-0.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
              title="Switch to tab mode"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
              </svg>
            </button>
            <button
              onClick={toggle}
              className="rounded p-0.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
              title="Close (Ctrl+Shift+D)"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <DevToolsTabs />

        <div className="flex-1 overflow-y-auto p-3 text-xs">
          {renderContent()}
        </div>
      </div>
    );
  }

  // Drawer mode
  if (panelMode === 'drawer') {
    return (
      <div
        ref={panelRef}
        className={`fixed top-6 bottom-0 z-[9999] flex flex-col border-zinc-700 bg-zinc-900 shadow-2xl ${
          drawerSide === 'right'
            ? 'right-0 border-l'
            : 'left-0 border-r'
        }`}
        style={{ width: panelWidth }}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-zinc-700 px-3 py-1.5 select-none">
          <span className="text-xs font-semibold text-zinc-300">
            Teki DevTools
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPanelMode('floating')}
              className="rounded p-0.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
              title="Switch to floating mode"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="5" y="5" width="14" height="14" rx="2" />
                <path d="M5 9h14" />
              </svg>
            </button>
            <button
              onClick={toggle}
              className="rounded p-0.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
              title="Close"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <DevToolsTabs />

        <div className="flex-1 overflow-y-auto p-3 text-xs">
          {renderContent()}
        </div>
      </div>
    );
  }

  // Tab mode (full-width bar below QuickPlanBar)
  return (
    <div
      ref={panelRef}
      className="fixed top-6 left-0 right-0 z-[9998] flex flex-col border-b border-zinc-700 bg-zinc-900 shadow-2xl"
      style={{ maxHeight: '50vh' }}
    >
      <div className="flex items-center justify-between border-b border-zinc-700 px-3 py-1.5 select-none">
        <span className="text-xs font-semibold text-zinc-300">
          Teki DevTools
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPanelMode('floating')}
            className="rounded p-0.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
            title="Switch to floating mode"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="5" y="5" width="14" height="14" rx="2" />
              <path d="M5 9h14" />
            </svg>
          </button>
          <button
            onClick={toggle}
            className="rounded p-0.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
            title="Close"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <DevToolsTabs />

      <div className="flex-1 overflow-y-auto p-3 text-xs">
        {renderContent()}
      </div>
    </div>
  );
}
