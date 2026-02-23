'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

function JsonValue({ value, depth = 0 }: { value: unknown; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const [copied, setCopied] = useState(false);

  if (value === null || value === undefined) {
    return <span className="text-zinc-500">null</span>;
  }

  if (typeof value === 'boolean') {
    return <span className="text-amber-400">{String(value)}</span>;
  }

  if (typeof value === 'number') {
    return <span className="text-emerald-400">{value}</span>;
  }

  if (typeof value === 'string') {
    if (value.length > 200) {
      return (
        <span className="text-sky-400">
          &quot;{value.slice(0, 200)}...&quot;
          <button
            className="ml-1 text-xs text-zinc-500 hover:text-zinc-300"
            onClick={() => {
              navigator.clipboard.writeText(value);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? <Check size={10} className="inline" /> : <Copy size={10} className="inline" />}
          </button>
        </span>
      );
    }
    return <span className="text-sky-400">&quot;{value}&quot;</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-zinc-500">[]</span>;

    return (
      <span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center text-zinc-500 hover:text-zinc-300"
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          <span className="text-xs ml-0.5">[{value.length}]</span>
        </button>
        {expanded && (
          <div className="ml-4 border-l border-white/5 pl-2">
            {value.map((item, i) => (
              <div key={i} className="py-0.5">
                <span className="text-zinc-600 text-xs mr-1">{i}:</span>
                <JsonValue value={item} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </span>
    );
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return <span className="text-zinc-500">{'{}'}</span>;

    return (
      <span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center text-zinc-500 hover:text-zinc-300"
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          <span className="text-xs ml-0.5">{'{'}...{'}'}</span>
        </button>
        {expanded && (
          <div className="ml-4 border-l border-white/5 pl-2">
            {entries.map(([key, val]) => (
              <div key={key} className="py-0.5">
                <span className="text-violet-400 text-xs">{key}</span>
                <span className="text-zinc-600">: </span>
                <JsonValue value={val} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </span>
    );
  }

  return <span className="text-zinc-400">{String(value)}</span>;
}

export function LogJsonViewer({
  data,
  className,
}: {
  data: unknown;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('relative rounded-lg border border-white/5 bg-black/30 p-3', className)}>
      <div className="absolute right-2 top-2 flex gap-1">
        <button
          onClick={handleCopy}
          className="rounded p-1 text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
          title="Copiar JSON"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <div className="font-mono text-xs leading-relaxed overflow-x-auto">
        <JsonValue value={data} />
      </div>
    </div>
  );
}
