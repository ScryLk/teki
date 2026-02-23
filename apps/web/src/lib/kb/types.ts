import type { KbArticleStatus, KbSolutionType, KbVisibility } from '@prisma/client';

export type { KbArticleStatus, KbSolutionType, KbVisibility };

export interface KbCategoryData {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  description: string | null;
  displayOrder: number;
  active: boolean;
}

export interface KbArticleListItem {
  id: string;
  articleNumber: string;
  title: string;
  category: KbCategoryData;
  subcategory: string | null;
  tags: string[];
  softwareName: string | null;
  errorCodes: string[];
  status: KbArticleStatus;
  solutionType: KbSolutionType;
  usageCount: number;
  successRate: number;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KbArticleFull {
  id: string;
  articleNumber: string;
  title: string;
  categoryId: string;
  category: KbCategoryData;
  subcategory: string | null;
  tags: string[];
  softwareName: string | null;
  versionMin: string | null;
  versionMax: string | null;
  modules: string[];
  environments: string[];
  databases: string[];
  problemDescription: string;
  rootCause: string | null;
  solutionSteps: string;
  solutionType: KbSolutionType;
  prevention: string | null;
  notes: string | null;
  errorCodes: string[];
  errorMessages: string[];
  relatedTables: string[];
  relatedConfigs: string[];
  sqlQueries: string | null;
  commands: string | null;
  relatedArticleIds: string[];
  supersededById: string | null;
  aiContextNote: string | null;
  priorityWeight: number;
  usageCount: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  lastUsedAt: string | null;
  avgResolutionMinutes: number | null;
  status: KbArticleStatus;
  visibility: KbVisibility;
  createdAt: string;
  updatedAt: string;
}

export interface KbStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  avgSuccessRate: number;
  topUsedArticles: { id: string; title: string; articleNumber: string; usageCount: number }[];
  categoryCounts: { categoryId: string; name: string; count: number }[];
}

export const SOLUTION_TYPE_LABELS: Record<KbSolutionType, string> = {
  PERMANENT_FIX: 'Correcao definitiva',
  WORKAROUND: 'Contorno temporario',
  CONFIGURATION: 'Configuracao',
  KNOWN_ISSUE: 'Problema conhecido',
  INFORMATIONAL: 'Informativo',
};

export const STATUS_LABELS: Record<KbArticleStatus, string> = {
  DRAFT: 'Rascunho',
  REVIEW: 'Em revisao',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Arquivado',
  DEPRECATED: 'Descontinuado',
};

export const VISIBILITY_LABELS: Record<KbVisibility, string> = {
  AI_ONLY: 'Somente IA',
  AGENTS_ONLY: 'Somente atendentes',
  AI_AND_AGENTS: 'IA e atendentes',
  PUBLIC: 'Publico',
};

export const DEFAULT_CATEGORIES = [
  { name: 'Erro de Aplicacao', slug: 'erro_aplicacao', icon: 'bug', color: '#EF4444', displayOrder: 1 },
  { name: 'Banco de Dados', slug: 'banco_dados', icon: 'database', color: '#F59E0B', displayOrder: 2 },
  { name: 'Impressao', slug: 'impressao', icon: 'printer', color: '#8B5CF6', displayOrder: 3 },
  { name: 'Rede / Conectividade', slug: 'rede', icon: 'wifi', color: '#3B82F6', displayOrder: 4 },
  { name: 'Performance', slug: 'performance', icon: 'gauge', color: '#10B981', displayOrder: 5 },
  { name: 'Integracoes / APIs', slug: 'integracao', icon: 'plug', color: '#EC4899', displayOrder: 6 },
  { name: 'Instalacao / Configuracao', slug: 'instalacao', icon: 'settings', color: '#6B7280', displayOrder: 7 },
  { name: 'Certificado Digital', slug: 'certificado', icon: 'shield-check', color: '#14B8A6', displayOrder: 8 },
  { name: 'Fiscal / Tributario', slug: 'fiscal', icon: 'file-text', color: '#F97316', displayOrder: 9 },
  { name: 'Outro', slug: 'outro', icon: 'help-circle', color: '#9CA3AF', displayOrder: 99 },
];
