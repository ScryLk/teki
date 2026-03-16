import { useEffect, useRef, useCallback } from 'react';
import { useConnectionStatusStore, type StatusValue } from '@/stores/connection-status-store';
import type { ChannelInfo, ChannelStatusEvent, ApiKeyStatus, AiProviderId } from '@teki/shared';

const CHANNEL_COLORS: Record<string, string> = {
  whatsapp: '#25D366',
  telegram: '#2AABEE',
  discord: '#5865F2',
  slack: '#E01E5A',
  teams: '#6264A7',
  instagram: '#E4405F',
};

const AI_PROVIDERS = [
  { id: 'gemini' as AiProviderId, name: 'Gemini', color: '#4285F4', keyField: 'geminiApiKey' as const, statusField: 'geminiKeyStatus' as const },
  { id: 'openai' as AiProviderId, name: 'OpenAI', color: '#10A37F', keyField: 'openaiApiKey' as const, statusField: 'openaiKeyStatus' as const },
  { id: 'anthropic' as AiProviderId, name: 'Anthropic', color: '#D97706', keyField: 'anthropicApiKey' as const, statusField: 'anthropicKeyStatus' as const },
  { id: 'ollama' as AiProviderId, name: 'Ollama', color: '#7C3AED', keyField: 'ollamaBaseUrl' as const, statusField: 'ollamaKeyStatus' as const },
];

function mapChannelStatus(status: ChannelInfo['status']): StatusValue {
  switch (status) {
    case 'connected': return 'online';
    case 'waiting': case 'reconnecting': return 'warning';
    case 'error': return 'offline';
    default: return 'unconfigured';
  }
}

function mapKeyStatus(hasKey: boolean, keyStatus: ApiKeyStatus): StatusValue {
  if (!hasKey) return 'unconfigured';
  switch (keyStatus) {
    case 'valid': return 'online';
    case 'invalid': return 'offline';
    case 'validating': return 'warning';
    default: return 'unconfigured';
  }
}

export function useConnectionStatus() {
  const upsertConnection = useConnectionStatusStore((s) => s.upsertConnection);
  const addDataPoint = useConnectionStatusStore((s) => s.addDataPoint);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const aiProbedRef = useRef(false);

  const pollOpenClaw = useCallback(async () => {
    const now = Date.now();
    try {
      const channels = await window.tekiAPI.openclawListChannels();
      for (const ch of channels) {
        const id = `oc_${ch.id}`;
        const status = mapChannelStatus(ch.status);
        upsertConnection({ id, name: ch.displayName, type: 'openclaw', color: CHANNEL_COLORS[ch.id] ?? '#71717a', currentStatus: status, currentLatencyMs: null });
        addDataPoint({ connectionId: id, connectionType: 'openclaw', status, latencyMs: null, timestamp: now });
      }
    } catch { /* ignore */ }
  }, [upsertConnection, addDataPoint]);

  const probeAI = useCallback(async () => {
    const now = Date.now();
    try {
      const settings = await window.tekiAPI.getAllSettings();
      for (const p of AI_PROVIDERS) {
        const id = `ai_${p.id}`;
        const key = settings[p.keyField] as string;
        const hasKey = !!key;
        const keyStatus = (settings[p.statusField] as ApiKeyStatus) ?? 'unconfigured';
        const status = mapKeyStatus(hasKey, keyStatus);

        let latencyMs: number | null = null;
        if (hasKey && status === 'online') {
          try {
            const result = await window.tekiAPI.validateApiKey(p.id, key);
            latencyMs = result.latencyMs;
          } catch { /* ignore */ }
        }

        upsertConnection({ id, name: p.name, type: 'ai', color: p.color, currentStatus: status, currentLatencyMs: latencyMs });
        addDataPoint({ connectionId: id, connectionType: 'ai', status, latencyMs, timestamp: now });
      }
    } catch { /* ignore */ }
  }, [upsertConnection, addDataPoint]);

  // Update AI status from settings without re-probing (lightweight)
  const updateAIStatus = useCallback(async () => {
    const now = Date.now();
    try {
      const settings = await window.tekiAPI.getAllSettings();
      for (const p of AI_PROVIDERS) {
        const id = `ai_${p.id}`;
        const hasKey = !!(settings[p.keyField] as string);
        const keyStatus = (settings[p.statusField] as ApiKeyStatus) ?? 'unconfigured';
        const status = mapKeyStatus(hasKey, keyStatus);
        const conn = useConnectionStatusStore.getState().connections[id];
        const latencyMs = conn?.currentLatencyMs ?? null;
        upsertConnection({ id, name: p.name, type: 'ai', color: p.color, currentStatus: status, currentLatencyMs: latencyMs });
        addDataPoint({ connectionId: id, connectionType: 'ai', status, latencyMs, timestamp: now });
      }
    } catch { /* ignore */ }
  }, [upsertConnection, addDataPoint]);

  useEffect(() => {
    // Initial polls
    pollOpenClaw();
    if (!aiProbedRef.current) {
      aiProbedRef.current = true;
      probeAI();
    }

    // Poll OpenClaw + AI status (lightweight) every 30s
    intervalRef.current = setInterval(() => {
      pollOpenClaw();
      updateAIStatus();
    }, 30_000);

    // Real-time OpenClaw updates
    const unsub = window.tekiAPI.onOpenclawStatusChanged((event: ChannelStatusEvent) => {
      const id = `oc_${event.channelId}`;
      const status = mapChannelStatus(event.status);
      addDataPoint({ connectionId: id, connectionType: 'openclaw', status, latencyMs: null, timestamp: Date.now() });
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      unsub();
    };
  }, [pollOpenClaw, probeAI, updateAIStatus, addDataPoint]);

  return { refreshAI: probeAI };
}
