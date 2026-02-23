'use client';

import { useState } from 'react';
import { IconCopy, IconCheck } from '@tabler/icons-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = 'bash' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-lg border border-[#3f3f46] bg-[#0f0f12] overflow-hidden my-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#3f3f46] bg-[#18181b]">
        <span className="text-[11px] font-mono text-[#71717a]">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] text-[#71717a] hover:text-[#fafafa] transition-colors"
          aria-label="Copiar código"
        >
          {copied ? (
            <>
              <IconCheck size={13} className="text-[#2A8F9D]" />
              <span className="text-[#2A8F9D]">Copiado!</span>
            </>
          ) : (
            <>
              <IconCopy size={13} />
              Copiar
            </>
          )}
        </button>
      </div>
      {/* Code */}
      <pre className="p-4 overflow-x-auto text-sm font-mono text-[#a1a1aa] leading-relaxed whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}
