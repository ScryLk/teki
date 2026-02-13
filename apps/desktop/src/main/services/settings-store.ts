import Store from 'electron-store';
import type { TekiSettings } from '@teki/shared';

const defaults: TekiSettings = {
  // Capture
  captureInterval: 5,
  captureSource: '',
  captureQuality: 'medium',
  autoCapture: false,

  // Chat
  showSources: true,
  autoAttachScreenshot: true,
  chatHistoryDays: 30,

  // Context
  defaultSistema: '',
  defaultVersao: '',
  defaultAmbiente: 'producao',
  nivelTecnico: 'intermediario',

  // Appearance
  catSize: 'md',
  showCat: true,
  layout: 'split',
  compactMode: false,

  // System
  startMinimized: false,
  startOnBoot: false,
  globalShortcut: 'CommandOrControl+Shift+T',
  language: 'pt-BR',

  // Algolia
  algoliaAppId: '',
  algoliaApiKey: '',
  algoliaAgentId: '',
};

const store = new Store<TekiSettings>({
  name: 'teki-settings',
  defaults,
});

export function get<K extends keyof TekiSettings>(key: K): TekiSettings[K] {
  return store.get(key);
}

export function set<K extends keyof TekiSettings>(key: K, value: TekiSettings[K]): void {
  store.set(key, value);
}

export function getAll(): TekiSettings {
  return store.store;
}

export default { get, set, getAll };
