import React, { useState } from 'react';
import type { ConnectorConfig } from './types';
import { PLATFORM_META } from './types';
import { PlatformLogo } from './SettingsIcons';
import StatusIndicator from './StatusIndicator';
import SettingsAccordion from './SettingsAccordion';
import FieldMappingBoard from './FieldMappingBoard';
import UserMappingTable from './UserMappingTable';
import SyncConfigPanel from './SyncConfigPanel';
import CredentialsPanel from './CredentialsPanel';
import SyncLogTable from './SyncLogTable';
import DisconnectConfirmModal from './DisconnectConfirmModal';

interface ConnectorCardProps {
  connector: ConnectorConfig;
  onDisconnect: () => void;
  onTest: () => void;
}

const ConnectorCard: React.FC<ConnectorCardProps> = ({ connector, onDisconnect, onTest }) => {
  const [showDisconnect, setShowDisconnect] = useState(false);
  const platformMeta = PLATFORM_META.find((p) => p.id === connector.platform);

  const syncDirectionLabel = connector.syncDirection === 'read_only' ? 'Somente leitura'
    : connector.syncDirection === 'bidirectional' ? 'Bidirecional'
      : 'Apenas notas';

  return (
    <>
      <div className="rounded-xl border border-[#27272a] bg-[#18181b] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#27272a]">
          <div className="flex items-center gap-3">
            <PlatformLogo platform={connector.platform} size={28} color="#a1a1aa" />
            <div>
              <h3 className="text-sm font-semibold text-[#fafafa]">{connector.displayName}</h3>
              <p className="text-xs text-[#52525b]">{connector.baseUrl}</p>
            </div>
          </div>
          <StatusIndicator status={connector.status} />
        </div>

        {/* Info grid */}
        <div className="px-5 py-4 border-b border-[#27272a]">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            <InfoRow label="Versão" value={connector.version ? `${platformMeta?.name} ${connector.version}` : '—'} />
            <InfoRow label="Última sync" value={connector.lastSync ?? '—'} />
            <InfoRow label="Tickets visíveis" value={String(connector.ticketCount ?? 0)} />
            <InfoRow label="Direção" value={syncDirectionLabel} />
          </div>
        </div>

        {/* Quick actions */}
        <div className="px-5 py-3 border-b border-[#27272a] bg-[#0f0f12]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#52525b] mr-1">Ações rápidas</span>
            <ActionButton icon="sync" label="Sincronizar agora" onClick={() => {}} />
            <ActionButton icon="test" label="Testar" onClick={onTest} />
            {connector.status === 'paused' ? (
              <ActionButton icon="play" label="Retomar" onClick={() => {}} />
            ) : (
              <ActionButton icon="pause" label="Pausar" onClick={() => {}} />
            )}
          </div>
        </div>

        {/* Stats 24h */}
        {connector.stats24h && (
          <div className="px-5 py-3 border-b border-[#27272a]">
            <p className="text-xs text-[#52525b] mb-2">Últimas 24 horas</p>
            <div className="flex items-center gap-4 text-xs">
              <StatItem label="Syncs" value={String(connector.stats24h.syncs)} />
              <StatItem label="Erros" value={String(connector.stats24h.errors)} alert={connector.stats24h.errors > 0} />
              <StatItem label="API calls" value={String(connector.stats24h.apiCalls)} />
              <StatItem label="Latência" value={`${connector.stats24h.avgLatency}ms`} />
              <StatItem label="Cache" value={`${connector.stats24h.cacheTotal} tickets (${connector.stats24h.cacheStale} stale)`} />
            </div>
          </div>
        )}

        {/* Expandable sections */}
        <div className="p-4 space-y-2">
          <SettingsAccordion title="Mapeamento de campos">
            <FieldMappingBoard platform={connector.platform} />
          </SettingsAccordion>

          <SettingsAccordion title="Mapeamento de usuários">
            <UserMappingTable />
          </SettingsAccordion>

          <SettingsAccordion title="Sincronização">
            <SyncConfigPanel syncDirection={connector.syncDirection} />
          </SettingsAccordion>

          <SettingsAccordion title="Credenciais">
            <CredentialsPanel platform={connector.platform} baseUrl={connector.baseUrl} />
          </SettingsAccordion>

          <SettingsAccordion title="Logs de sincronização">
            <SyncLogTable />
          </SettingsAccordion>
        </div>

        {/* Disconnect */}
        <div className="px-5 py-4 border-t border-[#27272a]">
          <button
            onClick={() => setShowDisconnect(true)}
            className="flex items-center gap-1.5 text-xs text-[#f31260]/70 hover:text-[#f31260] transition-colors"
          >
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Desconectar integração
          </button>
        </div>
      </div>

      {showDisconnect && (
        <DisconnectConfirmModal
          connectorName={connector.displayName}
          onConfirm={onDisconnect}
          onClose={() => setShowDisconnect(false)}
        />
      )}
    </>
  );
};

// ─── Sub-components ─────────────────────────────────────────────────────────

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-[#71717a]">{label}:</span>
    <span className="text-xs text-[#fafafa]">{value}</span>
  </div>
);

const StatItem: React.FC<{ label: string; value: string; alert?: boolean }> = ({ label, value, alert }) => (
  <div className="flex items-center gap-1">
    <span className="text-[#71717a]">{label}:</span>
    <span className={alert ? 'text-[#f5a524] font-medium' : 'text-[#fafafa]'}>{value}</span>
  </div>
);

const ActionButton: React.FC<{ icon: string; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#27272a] bg-[#18181b] text-xs text-[#a1a1aa] hover:text-[#fafafa] hover:border-[#3f3f46] transition-colors"
  >
    {icon === 'sync' && (
      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
      </svg>
    )}
    {icon === 'test' && (
      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
      </svg>
    )}
    {icon === 'pause' && (
      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
      </svg>
    )}
    {icon === 'play' && (
      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
    )}
    {label}
  </button>
);

export default ConnectorCard;
