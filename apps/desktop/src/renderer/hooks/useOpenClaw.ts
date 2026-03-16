import { useState, useEffect, useCallback } from 'react';
import type { ChannelInfo, ChannelStatusEvent, OpenClawChannelId, ChannelConfig } from '@teki/shared';

export function useOpenClaw() {
  const [channels, setChannels] = useState<ChannelInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const list = await window.tekiAPI.openclawListChannels();
      setChannels(list);
    } catch (err) {
      console.error('[useOpenClaw] Failed to list channels:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const unsubscribe = window.tekiAPI.onOpenclawStatusChanged((event: ChannelStatusEvent) => {
      setChannels((prev) =>
        prev.map((ch) =>
          ch.id === event.channelId
            ? { ...ch, status: event.status, detail: event.detail, error: event.error, qrDataUrl: event.qrDataUrl }
            : ch,
        ),
      );
    });

    return unsubscribe;
  }, [refresh]);

  const connect = useCallback(
    async (channelId: OpenClawChannelId, config: ChannelConfig) => {
      await window.tekiAPI.openclawConnect(channelId, config);
      await refresh();
    },
    [refresh],
  );

  const disconnect = useCallback(
    async (channelId: OpenClawChannelId) => {
      await window.tekiAPI.openclawDisconnect(channelId);
      await refresh();
    },
    [refresh],
  );

  const getQR = useCallback(async (channelId: OpenClawChannelId) => {
    return window.tekiAPI.openclawGetQR(channelId);
  }, []);

  const getOAuthUrl = useCallback(async (channelId: OpenClawChannelId) => {
    return window.tekiAPI.openclawGetOAuthUrl(channelId);
  }, []);

  return { channels, loading, connect, disconnect, getQR, getOAuthUrl, refresh };
}
