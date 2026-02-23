import { LogsDashboard } from '@/components/admin/logs/logs-dashboard';
import { Lock } from 'lucide-react';

export const metadata = {
  title: 'Logs da Plataforma | Teki Admin',
};

export default function AdminLogsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
            <Lock size={16} className="text-zinc-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>Admin</span>
              <span>&gt;</span>
              <span className="text-zinc-300">Logs da Plataforma</span>
            </div>
            <h1 className="text-lg font-semibold text-white">
              Logs da Plataforma
            </h1>
          </div>
        </div>

        {/* Dashboard */}
        <LogsDashboard />
      </div>
    </div>
  );
}
