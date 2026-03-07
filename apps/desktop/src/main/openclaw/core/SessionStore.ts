import Store from 'electron-store';
import type { ChannelConfig, OpenClawChannelId } from '@teki/shared';

interface ChannelSession {
  config: ChannelConfig;
  connectedAt: string;
  autoReconnect: boolean;
}

interface MessageLogEntry {
  channelId: string;
  sender: string;
  text: string;
  response: string;
  timestamp: number;
}

interface OpenClawData {
  channels: Record<string, ChannelSession>;
  messageLog: MessageLogEntry[];
}

const store = new Store<OpenClawData>({
  name: 'openclaw-sessions',
  defaults: {
    channels: {},
    messageLog: [],
  },
});

export function saveSession(channelId: OpenClawChannelId, config: ChannelConfig): void {
  const channels = store.get('channels');
  channels[channelId] = {
    config,
    connectedAt: new Date().toISOString(),
    autoReconnect: config.autoReconnect !== false,
  };
  store.set('channels', channels);
}

export function removeSession(channelId: OpenClawChannelId): void {
  const channels = store.get('channels');
  delete channels[channelId];
  store.set('channels', channels);
}

export function getSession(channelId: OpenClawChannelId): ChannelSession | null {
  const channels = store.get('channels');
  return channels[channelId] ?? null;
}

export function getAllSessions(): Record<string, ChannelSession> {
  return store.get('channels');
}

export function appendLog(entry: MessageLogEntry): void {
  const log = store.get('messageLog');
  log.push(entry);
  // Keep last 500 entries
  if (log.length > 500) log.splice(0, log.length - 500);
  store.set('messageLog', log);
}
