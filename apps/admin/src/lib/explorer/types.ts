// ═══════════════════════════════════════════════════════════════
// Explorer Types — Shared types for the Database Explorer module
// ═══════════════════════════════════════════════════════════════

export type ModelCategory =
  | 'core'
  | 'billing'
  | 'social'
  | 'messaging'
  | 'ai'
  | 'system'
  | 'integrations';

export type ColumnType =
  | 'text'
  | 'date'
  | 'datetime'
  | 'enum'
  | 'boolean'
  | 'number'
  | 'json'
  | 'relation'
  | 'url'
  | 'email'
  | 'id';

export type FilterType =
  | 'text'
  | 'select'
  | 'multi_select'
  | 'date_range'
  | 'number_range'
  | 'boolean';

export interface ColumnConfig {
  field: string;
  label: string;
  type: ColumnType;
  width?: string;
  sortable: boolean;
  truncate?: number;
  format?: string;
  enumColors?: Record<string, string>;
  relationModel?: string;
  relationField?: string;
  copyable?: boolean;
}

export interface FilterConfig {
  field: string;
  label: string;
  type: FilterType;
  options?: Array<{ value: string; label: string; color?: string }>;
  placeholder?: string;
}

export interface ModelConfig {
  prismaModel: string;
  displayName: string;
  icon: string;
  category: ModelCategory;
  description?: string;

  hiddenFields: string[];
  maskedFields: string[];
  readOnlyFields: string[];

  searchableFields: string[];
  defaultSortField: string;
  defaultSortOrder: 'asc' | 'desc';

  titleField: string;
  subtitleField?: string;

  listColumns: ColumnConfig[];
  filters: FilterConfig[];

  expandableRelations: string[];
  inlineRelations: string[];

  allowEdit: boolean;
  allowDelete: boolean;
  allowHardDelete: boolean;
  editableFields?: string[];

  softDeleteField?: string;

  exportable: boolean;
  maxExportRows: number;
}

export interface ModelSummary {
  prismaModel: string;
  displayName: string;
  icon: string;
  category: ModelCategory;
  description?: string;
  recordCount: number;
}

export interface PaginatedResult {
  data: Record<string, unknown>[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ExplorerQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  filters?: Record<string, unknown>;
  expand?: string[];
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface SystemOverview {
  users: {
    total: number;
    today: number;
    thisMonth: number;
    last30d: number;
    activeWeekly: number;
  };
  tenants: {
    total: number;
    active: number;
    plans: Record<string, number>;
  };
  conversations: {
    total: number;
    today: number;
  };
  messages: {
    total: number;
    today: number;
    aiGenerated: number;
  };
  ai: {
    totalTokensIn: number;
    totalTokensOut: number;
    totalCostUsd: number;
  };
  generatedAt: string;
}
