export const ALGOLIA_INDICES = {
  DOCUMENTACOES: 'documentacoes',
  TICKETS: 'tickets',
  SISTEMAS: 'sistemas',
  SOLUCOES: 'solucoes',
} as const;

export const ALGOLIA_AGENT_STUDIO_BASE_URL = (appId: string) =>
  `https://${appId}.algolia.net/agent-studio/1/agents`;

export const SISTEMAS_LIST = [
  'ERP Interno',
  'Fluig',
  'GLPI',
  'Microsoft Excel',
  'Microsoft Word',
  'Microsoft Outlook',
  'Microsoft Teams',
  'VPN Corporativa',
  'Active Directory',
  'SQL Server',
  'Oracle',
  'Linux Server',
  'Windows Server',
] as const;

export const AMBIENTES = ['producao', 'homologacao', 'dev'] as const;

export const NIVEIS_TECNICOS = ['basico', 'intermediario', 'avancado'] as const;
