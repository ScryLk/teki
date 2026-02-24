// ─── Settings Section Types ─────────────────────────────────────────────────

export type SettingsSection =
  | 'general'
  | 'team'
  | 'ai-models'
  | 'integrations'
  | 'notifications'
  | 'security'
  | 'plan'
  | 'privacy';

export const SETTINGS_SECTIONS: {
  id: SettingsSection;
  label: string;
  icon: string;
}[] = [
  { id: 'general', label: 'Geral', icon: 'settings' },
  { id: 'team', label: 'Equipe', icon: 'users' },
  { id: 'ai-models', label: 'IA & Modelos', icon: 'brain' },
  { id: 'integrations', label: 'Integrações', icon: 'plug' },
  { id: 'notifications', label: 'Notificações', icon: 'bell' },
  { id: 'security', label: 'Segurança', icon: 'shield' },
  { id: 'plan', label: 'Plano', icon: 'credit-card' },
  { id: 'privacy', label: 'Privacidade', icon: 'lock' },
];

// ─── Connector Types ────────────────────────────────────────────────────────

export type ConnectorPlatform = 'glpi' | 'zendesk' | 'freshdesk' | 'otrs';

export type ConnectorStatus = 'healthy' | 'degraded' | 'down' | 'paused' | 'configuring';

export type SyncDirection = 'read_only' | 'bidirectional' | 'write_back_notes';

export interface ConnectorConfig {
  id: string;
  platform: ConnectorPlatform;
  displayName: string;
  baseUrl: string;
  status: ConnectorStatus;
  version?: string;
  lastSync?: string;
  ticketCount?: number;
  categoryCount?: number;
  userCount?: number;
  syncDirection: SyncDirection;
  stats24h?: {
    syncs: number;
    errors: number;
    apiCalls: number;
    avgLatency: number;
    cacheTotal: number;
    cacheStale: number;
  };
}

export interface FieldMapping {
  externalValue: string;
  externalLabel: string;
  tekiValue: string | null;
  tekiLabel: string;
  isDefault: boolean;
  isCustom: boolean;
}

export interface FieldMappingGroupData {
  fieldName: string;
  label: string;
  mappings: FieldMapping[];
  tekiOptions: { value: string; label: string }[];
}

export interface UserMapping {
  externalId: string;
  externalName: string;
  externalEmail: string;
  tekiUserId: string | null;
  tekiName: string | null;
  status: 'matched' | 'unmatched' | 'ignored';
  method: 'auto' | 'manual' | 'skip';
}

export interface SyncLog {
  id: string;
  when: string;
  type: 'poll' | 'on_demand' | 'webhook' | 'write_back';
  tickets: number;
  errors: number;
  duration: string;
  errorDetail?: string;
}

// ─── Wizard Types ───────────────────────────────────────────────────────────

export type WizardStep = 1 | 2 | 3;

export interface TestStep {
  label: string;
  status: 'pending' | 'running' | 'success' | 'error';
  time?: number;
  detail?: string;
}

// ─── Platform Metadata ──────────────────────────────────────────────────────

export interface PlatformMeta {
  id: ConnectorPlatform;
  name: string;
  subtitle: string;
  versions: string;
  fields: PlatformField[];
}

export interface PlatformField {
  key: string;
  label: string;
  hint: string;
  type: 'url' | 'text' | 'password' | 'email';
  placeholder?: string;
}

export const PLATFORM_META: PlatformMeta[] = [
  {
    id: 'glpi',
    name: 'GLPI',
    subtitle: 'Open source',
    versions: 'v10.0+',
    fields: [
      { key: 'baseUrl', label: 'URL da API do GLPI', hint: 'Geralmente: https://seu-glpi.com/apirest.php', type: 'url', placeholder: 'https://glpi.merito.com.br/apirest.php' },
      { key: 'appToken', label: 'App Token', hint: 'GLPI > Configurar > Geral > API > App Token', type: 'password' },
      { key: 'userToken', label: 'User Token', hint: 'GLPI > Administração > Usuários > seu usuário > API Token', type: 'password' },
    ],
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    subtitle: 'Cloud',
    versions: 'Suite / Support',
    fields: [
      { key: 'baseUrl', label: 'URL do Zendesk', hint: 'Seu subdomínio no Zendesk', type: 'url', placeholder: 'https://merito.zendesk.com' },
      { key: 'email', label: 'Email do admin', hint: 'Email da conta admin do Zendesk', type: 'email', placeholder: 'admin@merito.com.br' },
      { key: 'apiToken', label: 'API Token', hint: 'Zendesk > Admin > Canais > API > Tokens', type: 'password' },
    ],
  },
  {
    id: 'freshdesk',
    name: 'Freshdesk',
    subtitle: 'Cloud',
    versions: 'Growth / Pro / Ent.',
    fields: [
      { key: 'baseUrl', label: 'URL do Freshdesk', hint: 'Seu subdomínio no Freshdesk', type: 'url', placeholder: 'https://merito.freshdesk.com' },
      { key: 'apiKey', label: 'API Key', hint: 'Freshdesk > Perfil > API Key (canto superior direito)', type: 'password' },
    ],
  },
  {
    id: 'otrs',
    name: 'OTRS / Znuny',
    subtitle: 'Open source',
    versions: 'Community / Corp.',
    fields: [
      { key: 'baseUrl', label: 'URL do Web Service REST', hint: 'URL do endpoint REST genérico do OTRS', type: 'url', placeholder: 'https://otrs.merito.com.br/otrs/nph-genericinterface.pl/Webservice/REST' },
      { key: 'username', label: 'Usuário', hint: 'Usuário com permissão de API no OTRS', type: 'text', placeholder: 'teki-api' },
      { key: 'password', label: 'Senha', hint: 'Senha do usuário da API', type: 'password' },
    ],
  },
];

// ─── Status Display ─────────────────────────────────────────────────────────

export const STATUS_DISPLAY: Record<ConnectorStatus, { icon: string; label: string; color: string }> = {
  healthy: { icon: '🟢', label: 'Conectado', color: '#17c964' },
  degraded: { icon: '🟡', label: 'Instável', color: '#f5a524' },
  down: { icon: '🔴', label: 'Desconectado', color: '#f31260' },
  paused: { icon: '⚪', label: 'Pausado', color: '#71717a' },
  configuring: { icon: '🔵', label: 'Configurando', color: '#006FEE' },
};

// ─── Error Messages ─────────────────────────────────────────────────────────

export interface ErrorGuide {
  title: string;
  steps: string[];
}

export const ERROR_MESSAGES: Record<string, ErrorGuide> = {
  'glpi:401:app_token': {
    title: 'App Token inválido',
    steps: [
      'Verifique se a API REST está habilitada: Configurar > Geral > API',
      'Confirme que o App Token está ativo e não expirado',
      'Verifique se o range de IP permite conexão',
    ],
  },
  'glpi:401:user_token': {
    title: 'User Token inválido',
    steps: [
      'Verifique o token em: Administração > Usuários > seu usuário',
      'Clique em "Regenerar" se o token antigo não funcionar',
      'Confirme que o usuário tem perfil com permissão de API',
    ],
  },
  'glpi:403:no_permission': {
    title: 'Sem permissão',
    steps: [
      'O usuário da API precisa do perfil "Super-Admin" ou perfil com:',
      '- Leitura em Assistência > Chamados',
      '- Leitura em Administração > Usuários',
      '- Leitura em Configurar > Dropdowns > Categorias de chamado',
    ],
  },
  'zendesk:401': {
    title: 'Credenciais inválidas',
    steps: [
      'Para API Token: use {email}/token como usuário',
      'Para OAuth: re-autorize a conexão',
      'Confirme que o token está ativo em Admin > Canais > API',
    ],
  },
  'freshdesk:401': {
    title: 'API Key inválida',
    steps: [
      'Verifique sua API Key em: Perfil > canto superior direito',
      'A key deve ter permissão de leitura em tickets',
    ],
  },
  'network:timeout': {
    title: 'Servidor não respondeu',
    steps: [
      'Verifique se a URL está correta e acessível',
      'O servidor pode estar fora do ar ou atrás de firewall',
      'Se usa VPN, confirme que está conectado',
    ],
  },
  'network:ssl': {
    title: 'Erro de certificado SSL',
    steps: [
      'O certificado do servidor pode estar expirado ou auto-assinado',
      'Verifique com o administrador do sistema',
    ],
  },
};

// ─── Default Field Mappings ─────────────────────────────────────────────────

export const GLPI_DEFAULT_MAPPINGS: FieldMappingGroupData[] = [
  {
    fieldName: 'status',
    label: 'Status',
    tekiOptions: [
      { value: 'open', label: 'open' },
      { value: 'in_progress', label: 'in_progress' },
      { value: 'waiting_info', label: 'waiting_info' },
      { value: 'resolved', label: 'resolved' },
      { value: 'closed', label: 'closed' },
    ],
    mappings: [
      { externalValue: '1', externalLabel: '1 - Novo', tekiValue: 'open', tekiLabel: 'open', isDefault: true, isCustom: false },
      { externalValue: '2', externalLabel: '2 - Em Atendimento', tekiValue: 'in_progress', tekiLabel: 'in_progress', isDefault: true, isCustom: false },
      { externalValue: '3', externalLabel: '3 - Planejado', tekiValue: 'in_progress', tekiLabel: 'in_progress', isDefault: true, isCustom: false },
      { externalValue: '4', externalLabel: '4 - Pendente', tekiValue: 'waiting_info', tekiLabel: 'waiting_info', isDefault: true, isCustom: false },
      { externalValue: '5', externalLabel: '5 - Solucionado', tekiValue: 'resolved', tekiLabel: 'resolved', isDefault: true, isCustom: false },
      { externalValue: '6', externalLabel: '6 - Fechado', tekiValue: 'closed', tekiLabel: 'closed', isDefault: true, isCustom: false },
    ],
  },
  {
    fieldName: 'priority',
    label: 'Prioridade',
    tekiOptions: [
      { value: 'low', label: 'low' },
      { value: 'medium', label: 'medium' },
      { value: 'high', label: 'high' },
      { value: 'critical', label: 'critical' },
    ],
    mappings: [
      { externalValue: '1', externalLabel: '1 - Muito baixa', tekiValue: 'low', tekiLabel: 'low', isDefault: true, isCustom: false },
      { externalValue: '2', externalLabel: '2 - Baixa', tekiValue: 'low', tekiLabel: 'low', isDefault: true, isCustom: false },
      { externalValue: '3', externalLabel: '3 - Média', tekiValue: 'medium', tekiLabel: 'medium', isDefault: true, isCustom: false },
      { externalValue: '4', externalLabel: '4 - Alta', tekiValue: 'high', tekiLabel: 'high', isDefault: true, isCustom: false },
      { externalValue: '5', externalLabel: '5 - Muito alta', tekiValue: 'critical', tekiLabel: 'critical', isDefault: true, isCustom: false },
    ],
  },
];

// ─── Demo Data ──────────────────────────────────────────────────────────────

export const DEMO_CONNECTOR: ConnectorConfig = {
  id: 'conn-1',
  platform: 'glpi',
  displayName: 'GLPI Produção',
  baseUrl: 'glpi.merito.com.br',
  status: 'healthy',
  version: '10.0.16',
  lastSync: 'há 2 minutos',
  ticketCount: 47,
  categoryCount: 12,
  userCount: 8,
  syncDirection: 'read_only',
  stats24h: {
    syncs: 288,
    errors: 0,
    apiCalls: 1440,
    avgLatency: 230,
    cacheTotal: 47,
    cacheStale: 3,
  },
};

export const DEMO_USER_MAPPINGS: UserMapping[] = [
  { externalId: '1', externalName: 'Lucas Silva', externalEmail: 'lucas@merito.com.br', tekiUserId: 'u1', tekiName: 'Lucas Silva', status: 'matched', method: 'auto' },
  { externalId: '2', externalName: 'Maria Santos', externalEmail: 'maria@merito.com.br', tekiUserId: 'u2', tekiName: 'Maria Santos', status: 'matched', method: 'auto' },
  { externalId: '3', externalName: 'João Oliveira', externalEmail: 'joao@merito.com.br', tekiUserId: null, tekiName: null, status: 'unmatched', method: 'manual' },
  { externalId: '4', externalName: 'Admin GLPI', externalEmail: 'admin@glpi.local', tekiUserId: null, tekiName: null, status: 'ignored', method: 'skip' },
];

export const DEMO_SYNC_LOGS: SyncLog[] = [
  { id: '1', when: '14:30 (2min)', type: 'poll', tickets: 47, errors: 0, duration: '1.2s' },
  { id: '2', when: '14:25', type: 'poll', tickets: 47, errors: 0, duration: '1.1s' },
  { id: '3', when: '14:20', type: 'poll', tickets: 46, errors: 0, duration: '1.3s' },
  { id: '4', when: '14:15', type: 'poll', tickets: 46, errors: 0, duration: '0.9s' },
  { id: '5', when: '14:10', type: 'on_demand', tickets: 1, errors: 0, duration: '0.3s' },
  { id: '6', when: '14:05', type: 'poll', tickets: 46, errors: 0, duration: '1.1s' },
  { id: '7', when: '13:42', type: 'poll', tickets: 45, errors: 1, duration: '3.2s', errorDetail: 'Timeout ao buscar ticket #38 (retry OK)' },
  { id: '8', when: '13:37', type: 'poll', tickets: 45, errors: 0, duration: '1.0s' },
];
