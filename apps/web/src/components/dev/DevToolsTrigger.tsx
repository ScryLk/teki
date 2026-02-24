'use client';

import { useDevTools } from '@/stores/dev-tools.store';

export default function DevToolsTrigger() {
  const isOpen = useDevTools((s) => s.isOpen);
  const toggle = useDevTools((s) => s.toggle);

  if (isOpen) return null;

  return (
    <button
      onClick={toggle}
      className="fixed bottom-4 right-4 z-[9999] flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-white shadow-lg ring-1 ring-zinc-700 transition-all hover:bg-zinc-700 hover:scale-110"
      title="Open DevTools (Ctrl+Shift+D)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    </button>
  );
}
