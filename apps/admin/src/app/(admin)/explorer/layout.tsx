'use client';

import { useEffect, useState } from 'react';
import ExplorerSidebar from '@/components/explorer/ExplorerSidebar';
import type { ModelSummary } from '@/lib/explorer/types';

export default function ExplorerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [models, setModels] = useState<ModelSummary[]>([]);

  useEffect(() => {
    fetch('/api/explorer/models')
      .then((r) => r.json())
      .then((data) => setModels(data.models || []))
      .catch(() => {});
  }, []);

  return (
    <div className="flex gap-6 min-h-0">
      {/* Explorer Sidebar */}
      <aside className="w-56 flex-shrink-0">
        <div className="sticky top-20">
          <p className="px-3 mb-3 text-xs font-semibold text-foreground flex items-center gap-2">
            Database Explorer
          </p>
          <ExplorerSidebar models={models} />
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
