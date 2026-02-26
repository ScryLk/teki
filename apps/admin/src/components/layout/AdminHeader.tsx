'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Bell } from 'lucide-react';

export default function AdminHeader() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between px-6 h-14 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div />

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors relative">
          <Bell className="w-4 h-4" />
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
    </header>
  );
}
