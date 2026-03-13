import React, { useState, useEffect } from 'react';
import { useMonitorStore } from '@/stores/monitor-store';
import { useMonitor } from '@/hooks/useMonitor';
import ServiceScorecard from './ServiceScorecard';
import LatencyChart from './LatencyChart';
import AvailabilityHeatmap from './AvailabilityHeatmap';
import InsightCards from './InsightCards';
import ConnectionStatusChart from './ConnectionStatusChart';
import ServiceConfigModal from './ServiceConfigModal';
import type { ChannelInfo, TekiSettings, ApiKeyStatus } from '@teki/shared';

// ─── Connection Card types ────────────────────────────────────────────────────

interface ConnectionCard {
  id: string;
  name: string;
  category: 'OpenClaw' | 'IA';
  status: 'online' | 'warning' | 'offline' | 'unconfigured';
  statusText: string;
  color: string;
}

const CHANNEL_COLORS: Record<string, string> = {
  whatsapp: '#25D366',
  telegram: '#2AABEE',
  discord: '#5865F2',
  slack: '#E01E5A',
  teams: '#6264A7',
  instagram: '#E4405F',
};

const AI_PROVIDERS: Array<{
  id: string;
  name: string;
  color: string;
  keyField: keyof TekiSettings;
  statusField: keyof TekiSettings;
}> = [
  { id: 'gemini', name: 'Gemini', color: '#4285F4', keyField: 'geminiApiKey', statusField: 'geminiKeyStatus' },
  { id: 'openai', name: 'OpenAI', color: '#10A37F', keyField: 'openaiApiKey', statusField: 'openaiKeyStatus' },
  { id: 'anthropic', name: 'Anthropic', color: '#D97706', keyField: 'anthropicApiKey', statusField: 'anthropicKeyStatus' },
  { id: 'ollama', name: 'Ollama', color: '#7C3AED', keyField: 'ollamaBaseUrl', statusField: 'ollamaKeyStatus' },
];

function mapChannelStatus(ch: ChannelInfo): ConnectionCard {
  const color = CHANNEL_COLORS[ch.id] ?? '#71717a';
  let status: ConnectionCard['status'] = 'unconfigured';
  let statusText = 'Inativo';

  switch (ch.status) {
    case 'connected':
      status = 'online';
      statusText = 'Conectado';
      break;
    case 'waiting':
    case 'reconnecting':
      status = 'warning';
      statusText = ch.status === 'waiting' ? 'Aguardando...' : 'Reconectando...';
      break;
    case 'error':
      status = 'offline';
      statusText = 'Erro';
      break;
    case 'idle':
      status = 'unconfigured';
      statusText = 'Inativo';
      break;
  }

  return { id: `oc_${ch.id}`, name: ch.displayName, category: 'OpenClaw', status, statusText, color };
}

function mapAIStatus(
  provider: typeof AI_PROVIDERS[number],
  settings: TekiSettings,
): ConnectionCard {
  const hasKey = !!(settings[provider.keyField] as string);
  const keyStatus = settings[provider.statusField] as ApiKeyStatus;

  let status: ConnectionCard['status'] = 'unconfigured';
  let statusText = 'Não configurado';

  if (hasKey) {
    switch (keyStatus) {
      case 'valid':
        status = 'online';
        statusText = 'API Key válida';
        break;
      case 'invalid':
        status = 'offline';
        statusText = 'Key inválida';
        break;
      case 'validating':
        status = 'warning';
        statusText = 'Validando...';
        break;
      default:
        status = 'online';
        statusText = 'Configurado';
        break;
    }
  }

  return { id: `ai_${provider.id}`, name: provider.name, category: 'IA', status, statusText, color: provider.color };
}

const STATUS_DOT: Record<ConnectionCard['status'], string> = {
  online: 'bg-emerald-400',
  warning: 'bg-amber-400 animate-pulse',
  offline: 'bg-red-400',
  unconfigured: 'bg-[#52525b]',
};

// ─── Component ────────────────────────────────────────────────────────────────

const MonitorDashboard: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [connections, setConnections] = useState<ConnectionCard[]>([]);
  const services = useMonitorStore((s) => s.services);
  const pings = useMonitorStore((s) => s.pings);
  const removeService = useMonitorStore((s) => s.removeService);

  // Initialize monitor subscriptions
  useMonitor();

  // Load OpenClaw channels + AI providers on mount
  useEffect(() => {
    const load = async () => {
      const [channels, settings] = await Promise.all([
        window.tekiAPI.openclawListChannels(),
        window.tekiAPI.getAllSettings(),
      ]);

      const cards: ConnectionCard[] = [
        ...channels.map(mapChannelStatus),
        ...AI_PROVIDERS.map((p) => mapAIStatus(p, settings)),
      ];
      setConnections(cards);
    };
    load();

    // Subscribe to OpenClaw status changes
    const unsub = window.tekiAPI.onOpenclawStatusChanged((event) => {
      setConnections((prev) =>
        prev.map((c) => {
          if (c.id !== `oc_${event.channelId}`) return c;
          const color = CHANNEL_COLORS[event.channelId] ?? '#71717a';
          let status: ConnectionCard['status'] = 'unconfigured';
          let statusText = 'Inativo';
          switch (event.status) {
            case 'connected':
              status = 'online'; statusText = 'Conectado'; break;
            case 'waiting':
            case 'reconnecting':
              status = 'warning'; statusText = event.status === 'waiting' ? 'Aguardando...' : 'Reconectando...'; break;
            case 'error':
              status = 'offline'; statusText = event.error || 'Erro'; break;
            default:
              status = 'unconfigured'; statusText = 'Inativo';
          }
          return { ...c, status, statusText, color };
        }),
      );
    });

    return unsub;
  }, []);

  const activeConnections = connections.filter((c) => c.status !== 'unconfigured');
  const inactiveConnections = connections.filter((c) => c.status === 'unconfigured');

  const handleRemove = async (serviceId: string) => {
    try {
      await window.tekiAPI?.monitorRemoveService(serviceId);
      removeService(serviceId);
    } catch (err) {
      console.error('Failed to remove service:', err);
    }
  };

  const handleProbeNow = async (serviceId: string) => {
    try {
      await window.tekiAPI?.monitorProbeNow(serviceId);
    } catch (err) {
      console.error('Failed to probe:', err);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-text-primary text-sm font-semibold">Monitor de Conexão</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1 text-xs bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
        >
          + Adicionar Serviço
        </button>
      </div>

      {/* Scorecard */}
      <ServiceScorecard />

      {/* Connection Status Chart */}
      <ConnectionStatusChart connections={connections} />

      {/* Active Connections */}
      {connections.length > 0 && (
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-text-secondary text-xs font-medium mb-3">Conexões Ativas</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {activeConnections.map((card) => (
              <div
                key={card.id}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-bg/50 border border-border/50 hover:border-border transition-colors"
              >
                <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[card.status]}`} />
                <div className="min-w-0">
                  <div className="text-text-primary text-xs font-medium truncate">{card.name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="text-[9px] font-semibold uppercase px-1 py-px rounded"
                      style={{ backgroundColor: card.color + '1a', color: card.color }}
                    >
                      {card.category}
                    </span>
                    <span className="text-text-muted text-[10px] truncate">{card.statusText}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Inactive / unconfigured */}
          {inactiveConnections.length > 0 && (
            <>
              <div className="text-text-muted text-[10px] mt-3 mb-1.5">Não configurados</div>
              <div className="flex flex-wrap gap-1.5">
                {inactiveConnections.map((card) => (
                  <span
                    key={card.id}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-bg/30 border border-border/30 text-[10px] text-text-muted"
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#52525b]" />
                    {card.name}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Service List */}
      {services.length > 0 && (
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-text-secondary text-xs font-medium mb-3">Serviços Monitorados</div>
          <div className="space-y-1.5">
            {services.map((svc) => {
              const latestPings = pings[svc.id] || [];
              const latest = latestPings[latestPings.length - 1];
              const statusColor = !latest
                ? 'bg-text-muted animate-pulse'
                : latest.status === 'online'
                  ? 'bg-success'
                  : latest.status === 'degraded'
                    ? 'bg-amber-400'
                    : 'bg-error';

              return (
                <div key={svc.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-bg/50">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${statusColor}`} />
                    <span className="text-text-primary text-xs font-medium">{svc.name}</span>
                    <span className="text-text-muted text-[10px] uppercase">{svc.type}</span>
                    <span className="text-text-muted text-[10px] font-mono">{svc.target}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {latest && (
                      <span className="text-text-muted text-[10px]">{latest.latencyMs.toFixed(0)}ms</span>
                    )}
                    <button
                      onClick={() => handleProbeNow(svc.id)}
                      className="text-text-muted hover:text-accent text-[10px] transition-colors"
                      title="Testar agora"
                    >
                      ping
                    </button>
                    <button
                      onClick={() => handleRemove(svc.id)}
                      className="text-text-muted hover:text-error text-[10px] transition-colors"
                      title="Remover"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Charts */}
      <LatencyChart />
      <AvailabilityHeatmap />

      {/* Insights */}
      <InsightCards />

      {/* Add Modal */}
      {showAddModal && <ServiceConfigModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
};

export default MonitorDashboard;
