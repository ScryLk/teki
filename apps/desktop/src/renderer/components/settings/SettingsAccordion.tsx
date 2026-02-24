import React, { useState } from 'react';

interface SettingsAccordionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const SettingsAccordion: React.FC<SettingsAccordionProps> = ({ title, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-[#27272a] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#18181b] hover:bg-[#1f1f23] transition-colors text-left"
      >
        <span className="text-sm font-medium text-[#fafafa]">{title}</span>
        <svg
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-[#71717a] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="bg-[#0f0f12] px-4 py-4 border-t border-[#27272a]">
          {children}
        </div>
      )}
    </div>
  );
};

export default SettingsAccordion;
