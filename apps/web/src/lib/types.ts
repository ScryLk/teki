export type SolutionStatus = 'uploading' | 'extracting' | 'indexing' | 'indexed' | 'error';

export type Criticality = 'baixa' | 'media' | 'alta' | 'critica';

export const CATEGORIES = [
  'Infraestrutura',
  'Banco de Dados',
  'ERP',
  'Fluig',
  'GLPI',
  'Rede',
  'Outro',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const RELATED_SYSTEMS = [
  'ERP Interno',
  'Microsoft Excel',
  'Microsoft Word',
  'Microsoft Outlook',
  'Microsoft Teams',
  'GLPI',
  'VPN Corporativa',
  'Active Directory',
  'Fluig',
  'SQL Server',
  'Oracle',
  'Linux Server',
  'Windows Server',
] as const;

export interface SolutionRecord {
  id: string;
  titulo: string;
  descricao: string;
  categoria: Category;
  tags: string[];
  sistemasRelacionados: string[];
  criticidade: Criticality;
  author: string;
  createdAt: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
  status: SolutionStatus;
  totalChunks: number;
  errorMessage?: string;
}

