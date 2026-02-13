import React, { useCallback, useRef, useState } from 'react';

interface SplitLayoutProps {
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
}

const MIN_PANEL_WIDTH = 300;
const DEFAULT_SPLIT_RATIO = 0.6;

const SplitLayout: React.FC<SplitLayoutProps> = ({ leftPanel, rightPanel }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [splitRatio, setSplitRatio] = useState(DEFAULT_SPLIT_RATIO);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);

      const container = containerRef.current;
      if (!container) return;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const mouseX = moveEvent.clientX - containerRect.left;

        // Enforce minimum widths
        const minRatio = MIN_PANEL_WIDTH / containerWidth;
        const maxRatio = 1 - MIN_PANEL_WIDTH / containerWidth;

        const newRatio = Math.min(maxRatio, Math.max(minRatio, mouseX / containerWidth));
        setSplitRatio(newRatio);
      };

      const onMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    []
  );

  return (
    <div ref={containerRef} className="flex h-full w-full overflow-hidden">
      {/* Left panel */}
      <div
        className="h-full overflow-hidden"
        style={{ width: `${splitRatio * 100}%` }}
      >
        {leftPanel}
      </div>

      {/* Draggable divider */}
      <div
        onMouseDown={handleMouseDown}
        className={`relative flex-shrink-0 cursor-col-resize group ${
          isDragging ? 'z-10' : ''
        }`}
        style={{ width: 4 }}
      >
        {/* Visible divider line */}
        <div
          className={`absolute inset-0 transition-colors ${
            isDragging
              ? 'bg-accent'
              : 'bg-border group-hover:bg-accent'
          }`}
        />
        {/* Wider invisible hit area for easier grabbing */}
        <div className="absolute inset-y-0 -left-1 -right-1" />
      </div>

      {/* Right panel */}
      <div
        className="h-full overflow-hidden"
        style={{ width: `${(1 - splitRatio) * 100}%` }}
      >
        {rightPanel}
      </div>
    </div>
  );
};

export default SplitLayout;
