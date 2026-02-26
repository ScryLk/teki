import { ModelConfig } from './types';

/**
 * Registry that defines how each Prisma model appears in the explorer.
 * Source of truth for: which tables to show, which fields to hide,
 * sensitive fields (masking), search fields, etc.
 *
 * If a model is NOT here, it does NOT appear in the explorer.
 */
export const MODEL_REGISTRY: ModelConfig[] = [
  // ════════════════════ CORE ════════════════════
  {
    prismaModel: 'User',
    displayName: 'Usuarios',
    icon: 'Users',
    category: 'core',
    description: 'Todos os usuarios registrados',

    hiddenFields: [
      'emailVerificationTokenHash',
      'lastLoginIp',
      'lastLoginUserAgent',
      'anonymizedBy',
    ],
    maskedFields: ['email', 'phone'],
    readOnlyFields: ['id', 'createdAt', 'updatedAt'],

    searchableFields: ['firstName', 'lastName', 'displayName', 'email', 'username'],
    defaultSortField: 'createdAt',
    defaultSortOrder: 'desc',

    titleField: 'displayName',
    subtitleField: 'email',

    listColumns: [
      { field: 'id', label: 'ID', type: 'id', width: '80px', sortable: false, truncate: 8, copyable: true },
      { field: 'firstName', label: 'Nome', type: 'text', width: '150px', sortable: true },
      { field: 'lastName', label: 'Sobrenome', type: 'text', width: '150px', sortable: true },
      { field: 'email', label: 'Email', type: 'email', width: '220px', sortable: true },
      { field: 'status', label: 'Status', type: 'enum', width: '140px', sortable: true,
        enumColors: {
          PENDING_VERIFICATION: '#F9CA24',
          ACTIVE: '#00B894',
          SUSPENDED: '#FF6B6B',
          DEACTIVATED: '#9090A0',
          ANONYMIZED: '#5A5A6E',
        },
      },
      { field: 'emailVerified', label: 'Verificado', type: 'boolean', width: '90px', sortable: true },
      { field: 'lastLoginAt', label: 'Ultimo Login', type: 'datetime', width: '160px', sortable: true },
      { field: 'createdAt', label: 'Criado', type: 'datetime', width: '160px', sortable: true },
    ],

    filters: [
      { field: 'status', label: 'Status', type: 'multi_select',
        options: [
          { value: 'ACTIVE', label: 'Ativo', color: '#00B894' },
          { value: 'PENDING_VERIFICATION', label: 'Pendente', color: '#F9CA24' },
          { value: 'SUSPENDED', label: 'Suspenso', color: '#FF6B6B' },
          { value: 'DEACTIVATED', label: 'Desativado', color: '#9090A0' },
        ],
      },
      { field: 'emailVerified', label: 'Email Verificado', type: 'boolean' },
      { field: 'createdAt', label: 'Criado em', type: 'date_range' },
    ],

    expandableRelations: ['memberships', 'sessions', 'agents'],
    inlineRelations: [],

    allowEdit: true,
    allowDelete: false,
    allowHardDelete: false,
    editableFields: ['firstName', 'lastName', 'displayName', 'status', 'onboardingStep'],

    exportable: true,
    maxExportRows: 10000,
  },

  {
    prismaModel: 'Tenant',
    displayName: 'Tenants',
    icon: 'Building2',
    category: 'core',
    description: 'Empresas e organizacoes',

    hiddenFields: ['stripeCustomerId', 'mpPreapprovalId'],
    maskedFields: ['email', 'billingEmail', 'taxId'],
    readOnlyFields: ['id', 'createdAt', 'updatedAt'],

    searchableFields: ['name', 'slug', 'email'],
    defaultSortField: 'createdAt',
    defaultSortOrder: 'desc',

    titleField: 'name',
    subtitleField: 'slug',

    listColumns: [
      { field: 'id', label: 'ID', type: 'id', width: '80px', sortable: false, truncate: 8, copyable: true },
      { field: 'name', label: 'Nome', type: 'text', width: '200px', sortable: true },
      { field: 'slug', label: 'Slug', type: 'text', width: '150px', sortable: true, copyable: true },
      { field: 'plan', label: 'Plano', type: 'enum', width: '120px', sortable: true,
        enumColors: { FREE: '#9090A0', STARTER: '#00B894', PRO: '#6C5CE7', ENTERPRISE: '#F9CA24' },
      },
      { field: 'status', label: 'Status', type: 'enum', width: '110px', sortable: true,
        enumColors: { TRIAL: '#F9CA24', ACTIVE: '#00B894', SUSPENDED: '#FF6B6B', CANCELLED: '#9090A0' },
      },
      { field: 'country', label: 'Pais', type: 'text', width: '60px', sortable: true },
      { field: 'createdAt', label: 'Criado', type: 'datetime', width: '160px', sortable: true },
    ],

    filters: [
      { field: 'plan', label: 'Plano', type: 'multi_select',
        options: [
          { value: 'FREE', label: 'Free' },
          { value: 'STARTER', label: 'Starter' },
          { value: 'PRO', label: 'Pro' },
          { value: 'ENTERPRISE', label: 'Enterprise' },
        ],
      },
      { field: 'status', label: 'Status', type: 'multi_select',
        options: [
          { value: 'TRIAL', label: 'Trial' },
          { value: 'ACTIVE', label: 'Ativo' },
          { value: 'SUSPENDED', label: 'Suspenso' },
          { value: 'CANCELLED', label: 'Cancelado' },
        ],
      },
      { field: 'createdAt', label: 'Criado em', type: 'date_range' },
    ],

    expandableRelations: ['members', 'conversations'],
    inlineRelations: [],

    allowEdit: true,
    allowDelete: false,
    allowHardDelete: false,
    editableFields: ['name', 'plan', 'status', 'settings'],

    exportable: true,
    maxExportRows: 10000,
  },

  {
    prismaModel: 'TenantMember',
    displayName: 'Membros de Tenant',
    icon: 'UserPlus',
    category: 'core',
    description: 'Vinculo usuario-tenant',

    hiddenFields: ['inviteTokenHash'],
    maskedFields: [],
    readOnlyFields: ['id', 'tenantId', 'userId', 'createdAt', 'updatedAt'],

    searchableFields: ['jobTitle', 'department'],
    defaultSortField: 'createdAt',
    defaultSortOrder: 'desc',

    titleField: 'role',
    subtitleField: 'status',

    listColumns: [
      { field: 'id', label: 'ID', type: 'id', width: '80px', sortable: false, truncate: 8 },
      { field: 'userId', label: 'Usuario', type: 'relation', width: '180px', sortable: false, relationModel: 'User', relationField: 'displayName' },
      { field: 'tenantId', label: 'Tenant', type: 'relation', width: '180px', sortable: false, relationModel: 'Tenant', relationField: 'name' },
      { field: 'role', label: 'Role', type: 'enum', width: '100px', sortable: true,
        enumColors: { OWNER: '#F9CA24', ADMIN: '#6C5CE7', AGENT: '#00B894', VIEWER: '#9090A0', BILLING: '#E17055' },
      },
      { field: 'status', label: 'Status', type: 'enum', width: '100px', sortable: true,
        enumColors: { INVITED: '#F9CA24', ACTIVE: '#00B894', SUSPENDED: '#FF6B6B', REMOVED: '#9090A0' },
      },
      { field: 'createdAt', label: 'Criado', type: 'datetime', width: '160px', sortable: true },
    ],

    filters: [
      { field: 'role', label: 'Role', type: 'multi_select',
        options: [
          { value: 'OWNER', label: 'Owner' },
          { value: 'ADMIN', label: 'Admin' },
          { value: 'AGENT', label: 'Agent' },
          { value: 'VIEWER', label: 'Viewer' },
        ],
      },
      { field: 'status', label: 'Status', type: 'select',
        options: [
          { value: 'ACTIVE', label: 'Ativo' },
          { value: 'INVITED', label: 'Convidado' },
          { value: 'SUSPENDED', label: 'Suspenso' },
        ],
      },
    ],

    expandableRelations: ['user', 'tenant'],
    inlineRelations: [],

    allowEdit: true,
    allowDelete: false,
    allowHardDelete: false,
    editableFields: ['role', 'status', 'jobTitle', 'department'],

    exportable: true,
    maxExportRows: 10000,
  },

  // ════════════════════ MESSAGING ════════════════════
  {
    prismaModel: 'Conversation',
    displayName: 'Conversas',
    icon: 'MessagesSquare',
    category: 'messaging',
    description: 'Todas as conversas do sistema',

    hiddenFields: [],
    maskedFields: [],
    readOnlyFields: ['id', 'tenantId', 'createdBy', 'createdAt', 'updatedAt'],

    searchableFields: ['title', 'slug'],
    defaultSortField: 'createdAt',
    defaultSortOrder: 'desc',

    titleField: 'title',
    subtitleField: 'type',

    listColumns: [
      { field: 'id', label: 'ID', type: 'id', width: '80px', sortable: false, truncate: 8, copyable: true },
      { field: 'title', label: 'Titulo', type: 'text', width: '250px', sortable: true, truncate: 50 },
      { field: 'type', label: 'Tipo', type: 'enum', width: '120px', sortable: true },
      { field: 'status', label: 'Status', type: 'enum', width: '100px', sortable: true,
        enumColors: { ACTIVE: '#00B894', ARCHIVED: '#9090A0', CLOSED: '#5A5A6E', DELETED: '#FF6B6B' },
      },
      { field: 'messageCount', label: 'Msgs', type: 'number', width: '70px', sortable: true },
      { field: 'totalAiMessages', label: 'IA Msgs', type: 'number', width: '70px', sortable: true },
      { field: 'createdAt', label: 'Criado', type: 'datetime', width: '160px', sortable: true },
    ],

    filters: [
      { field: 'type', label: 'Tipo', type: 'multi_select',
        options: [
          { value: 'AI_CHAT', label: 'AI Chat' },
          { value: 'FLOATING', label: 'Floating' },
          { value: 'INTERNAL_NOTE', label: 'Nota Interna' },
          { value: 'SUPPORT_CHAT', label: 'Suporte' },
        ],
      },
      { field: 'status', label: 'Status', type: 'multi_select',
        options: [
          { value: 'ACTIVE', label: 'Ativo' },
          { value: 'ARCHIVED', label: 'Arquivado' },
          { value: 'CLOSED', label: 'Fechado' },
        ],
      },
      { field: 'createdAt', label: 'Criado em', type: 'date_range' },
    ],

    expandableRelations: ['participants', 'messages'],
    inlineRelations: ['creator'],

    allowEdit: false,
    allowDelete: false,
    allowHardDelete: false,

    exportable: true,
    maxExportRows: 10000,
  },

  {
    prismaModel: 'Message',
    displayName: 'Mensagens',
    icon: 'MessageSquare',
    category: 'messaging',
    description: 'Todas as mensagens',

    hiddenFields: [],
    maskedFields: [],
    readOnlyFields: ['id', 'conversationId', 'tenantId', 'senderId', 'createdAt', 'updatedAt'],

    searchableFields: ['content'],
    defaultSortField: 'createdAt',
    defaultSortOrder: 'desc',

    titleField: 'contentType',
    subtitleField: 'status',

    listColumns: [
      { field: 'id', label: 'ID', type: 'id', width: '80px', sortable: false, truncate: 8 },
      { field: 'senderType', label: 'Tipo', type: 'enum', width: '80px', sortable: true },
      { field: 'contentType', label: 'Conteudo', type: 'enum', width: '100px', sortable: true },
      { field: 'content', label: 'Texto', type: 'text', width: '300px', sortable: false, truncate: 80 },
      { field: 'status', label: 'Status', type: 'enum', width: '90px', sortable: true },
      { field: 'isAiGenerated', label: 'IA', type: 'boolean', width: '50px', sortable: true },
      { field: 'createdAt', label: 'Criado', type: 'datetime', width: '160px', sortable: true },
    ],

    filters: [
      { field: 'senderType', label: 'Remetente', type: 'select',
        options: [
          { value: 'USER_SENDER', label: 'Usuario' },
          { value: 'AI_SENDER', label: 'IA' },
          { value: 'SYSTEM_SENDER', label: 'Sistema' },
        ],
      },
      { field: 'isAiGenerated', label: 'Gerado por IA', type: 'boolean' },
      { field: 'createdAt', label: 'Criado em', type: 'date_range' },
    ],

    expandableRelations: ['aiMetadata', 'sources', 'feedback'],
    inlineRelations: [],

    allowEdit: false,
    allowDelete: false,
    allowHardDelete: false,

    exportable: false,
    maxExportRows: 0,
  },

  // ════════════════════ AI ════════════════════
  {
    prismaModel: 'Agent',
    displayName: 'Agentes',
    icon: 'Bot',
    category: 'ai',
    description: 'Agentes de IA configurados',

    hiddenFields: [],
    maskedFields: [],
    readOnlyFields: ['id', 'userId', 'createdAt', 'updatedAt'],

    searchableFields: ['name', 'description'],
    defaultSortField: 'createdAt',
    defaultSortOrder: 'desc',

    titleField: 'name',
    subtitleField: 'model',

    listColumns: [
      { field: 'id', label: 'ID', type: 'id', width: '80px', sortable: false, truncate: 8, copyable: true },
      { field: 'name', label: 'Nome', type: 'text', width: '200px', sortable: true },
      { field: 'model', label: 'Modelo', type: 'text', width: '150px', sortable: true },
      { field: 'isDefault', label: 'Padrao', type: 'boolean', width: '70px', sortable: true },
      { field: 'createdAt', label: 'Criado', type: 'datetime', width: '160px', sortable: true },
    ],

    filters: [
      { field: 'isDefault', label: 'Padrao', type: 'boolean' },
    ],

    expandableRelations: ['documents', 'channels'],
    inlineRelations: ['user'],

    allowEdit: false,
    allowDelete: false,
    allowHardDelete: false,

    exportable: true,
    maxExportRows: 5000,
  },

  {
    prismaModel: 'MessageAiMetadata',
    displayName: 'AI Metadata',
    icon: 'Cpu',
    category: 'ai',
    description: 'Metadados de IA por mensagem',

    hiddenFields: [],
    maskedFields: [],
    readOnlyFields: ['id', 'messageId', 'conversationId', 'tenantId', 'createdAt'],

    searchableFields: ['provider', 'model'],
    defaultSortField: 'createdAt',
    defaultSortOrder: 'desc',

    titleField: 'model',
    subtitleField: 'provider',

    listColumns: [
      { field: 'id', label: 'ID', type: 'id', width: '80px', sortable: false, truncate: 8 },
      { field: 'provider', label: 'Provider', type: 'text', width: '100px', sortable: true },
      { field: 'model', label: 'Modelo', type: 'text', width: '150px', sortable: true },
      { field: 'tokensInput', label: 'Tokens In', type: 'number', width: '90px', sortable: true },
      { field: 'tokensOutput', label: 'Tokens Out', type: 'number', width: '90px', sortable: true },
      { field: 'latencyMs', label: 'Latencia (ms)', type: 'number', width: '100px', sortable: true },
      { field: 'wasFallback', label: 'Fallback', type: 'boolean', width: '70px', sortable: true },
      { field: 'cacheHit', label: 'Cache', type: 'boolean', width: '60px', sortable: true },
      { field: 'createdAt', label: 'Criado', type: 'datetime', width: '160px', sortable: true },
    ],

    filters: [
      { field: 'provider', label: 'Provider', type: 'text', placeholder: 'openai, google...' },
      { field: 'wasFallback', label: 'Fallback', type: 'boolean' },
      { field: 'cacheHit', label: 'Cache Hit', type: 'boolean' },
      { field: 'createdAt', label: 'Periodo', type: 'date_range' },
    ],

    expandableRelations: ['message'],
    inlineRelations: [],

    allowEdit: false,
    allowDelete: false,
    allowHardDelete: false,

    exportable: true,
    maxExportRows: 50000,
  },

  // ════════════════════ INTEGRATIONS ════════════════════
  {
    prismaModel: 'Channel',
    displayName: 'Canais',
    icon: 'Radio',
    category: 'integrations',
    description: 'Canais de atendimento (WhatsApp, Telegram, etc)',

    hiddenFields: ['platformConfig'],
    maskedFields: [],
    readOnlyFields: ['id', 'userId', 'agentId', 'createdAt', 'updatedAt'],

    searchableFields: ['displayName'],
    defaultSortField: 'createdAt',
    defaultSortOrder: 'desc',

    titleField: 'displayName',
    subtitleField: 'platform',

    listColumns: [
      { field: 'id', label: 'ID', type: 'id', width: '80px', sortable: false, truncate: 8 },
      { field: 'displayName', label: 'Nome', type: 'text', width: '200px', sortable: true },
      { field: 'platform', label: 'Plataforma', type: 'enum', width: '120px', sortable: true,
        enumColors: { WHATSAPP: '#25D366', TELEGRAM: '#0088cc', DISCORD: '#5865F2', SLACK: '#4A154B' },
      },
      { field: 'status', label: 'Status', type: 'enum', width: '120px', sortable: true,
        enumColors: { PENDING: '#F9CA24', CONNECTING: '#6C5CE7', ACTIVE: '#00B894', DISCONNECTED: '#FF6B6B', ERROR: '#E17055' },
      },
      { field: 'isActive', label: 'Ativo', type: 'boolean', width: '60px', sortable: true },
      { field: 'createdAt', label: 'Criado', type: 'datetime', width: '160px', sortable: true },
    ],

    filters: [
      { field: 'platform', label: 'Plataforma', type: 'multi_select',
        options: [
          { value: 'WHATSAPP', label: 'WhatsApp' },
          { value: 'TELEGRAM', label: 'Telegram' },
          { value: 'DISCORD', label: 'Discord' },
          { value: 'SLACK', label: 'Slack' },
        ],
      },
      { field: 'status', label: 'Status', type: 'select',
        options: [
          { value: 'ACTIVE', label: 'Ativo' },
          { value: 'DISCONNECTED', label: 'Desconectado' },
          { value: 'ERROR', label: 'Erro' },
        ],
      },
      { field: 'isActive', label: 'Ativo', type: 'boolean' },
    ],

    expandableRelations: ['conversations'],
    inlineRelations: ['user', 'agent'],

    allowEdit: false,
    allowDelete: false,
    allowHardDelete: false,

    exportable: true,
    maxExportRows: 5000,
  },

  // ════════════════════ SYSTEM ════════════════════
  {
    prismaModel: 'DataAccessLog',
    displayName: 'Audit Log',
    icon: 'ClipboardList',
    category: 'system',
    description: 'Registro de acesso a dados pessoais (LGPD)',

    hiddenFields: ['ipAddress', 'userAgent'],
    maskedFields: [],
    readOnlyFields: ['id', 'accessorId', 'subjectId', 'createdAt'],

    searchableFields: ['action'],
    defaultSortField: 'createdAt',
    defaultSortOrder: 'desc',

    titleField: 'action',
    subtitleField: 'accessorType',

    listColumns: [
      { field: 'id', label: 'ID', type: 'id', width: '80px', sortable: false, truncate: 8 },
      { field: 'accessorType', label: 'Tipo', type: 'enum', width: '100px', sortable: true },
      { field: 'action', label: 'Acao', type: 'enum', width: '120px', sortable: true,
        enumColors: { VIEW: '#00B894', EXPORT: '#6C5CE7', MODIFY: '#F9CA24', DELETE: '#FF6B6B', ANONYMIZE: '#E17055' },
      },
      { field: 'dataCategories', label: 'Categorias', type: 'json', width: '200px', sortable: false },
      { field: 'legalBasis', label: 'Base Legal', type: 'text', width: '120px', sortable: true },
      { field: 'createdAt', label: 'Quando', type: 'datetime', width: '160px', sortable: true },
    ],

    filters: [
      { field: 'action', label: 'Acao', type: 'multi_select',
        options: [
          { value: 'VIEW', label: 'Visualizar' },
          { value: 'EXPORT', label: 'Exportar' },
          { value: 'MODIFY', label: 'Modificar' },
          { value: 'DELETE', label: 'Excluir' },
          { value: 'ANONYMIZE', label: 'Anonimizar' },
        ],
      },
      { field: 'accessorType', label: 'Tipo Acesso', type: 'select',
        options: [
          { value: 'USER', label: 'Usuario' },
          { value: 'ADMIN', label: 'Admin' },
          { value: 'SYSTEM', label: 'Sistema' },
        ],
      },
      { field: 'createdAt', label: 'Periodo', type: 'date_range' },
    ],

    expandableRelations: ['subject'],
    inlineRelations: [],

    allowEdit: false,
    allowDelete: false,
    allowHardDelete: false,

    exportable: true,
    maxExportRows: 50000,
  },

  {
    prismaModel: 'Notification',
    displayName: 'Notificacoes',
    icon: 'Bell',
    category: 'system',
    description: 'Fila central de notificacoes',

    hiddenFields: [],
    maskedFields: [],
    readOnlyFields: ['id', 'tenantId', 'recipientId', 'createdAt', 'updatedAt'],

    searchableFields: ['title', 'body', 'type'],
    defaultSortField: 'createdAt',
    defaultSortOrder: 'desc',

    titleField: 'title',
    subtitleField: 'type',

    listColumns: [
      { field: 'id', label: 'ID', type: 'id', width: '80px', sortable: false, truncate: 8 },
      { field: 'type', label: 'Tipo', type: 'text', width: '180px', sortable: true },
      { field: 'title', label: 'Titulo', type: 'text', width: '250px', sortable: false, truncate: 50 },
      { field: 'priority', label: 'Prioridade', type: 'enum', width: '100px', sortable: true,
        enumColors: { URGENT: '#FF6B6B', HIGH: '#E17055', NORMAL: '#00B894', LOW: '#9090A0' },
      },
      { field: 'isRead', label: 'Lida', type: 'boolean', width: '60px', sortable: true },
      { field: 'createdAt', label: 'Criado', type: 'datetime', width: '160px', sortable: true },
    ],

    filters: [
      { field: 'priority', label: 'Prioridade', type: 'select',
        options: [
          { value: 'URGENT', label: 'Urgente' },
          { value: 'HIGH', label: 'Alta' },
          { value: 'NORMAL', label: 'Normal' },
          { value: 'LOW', label: 'Baixa' },
        ],
      },
      { field: 'isRead', label: 'Lida', type: 'boolean' },
      { field: 'createdAt', label: 'Periodo', type: 'date_range' },
    ],

    expandableRelations: ['recipient', 'actor'],
    inlineRelations: [],

    allowEdit: false,
    allowDelete: false,
    allowHardDelete: false,

    exportable: false,
    maxExportRows: 0,
  },

  {
    prismaModel: 'UserSession',
    displayName: 'Sessoes',
    icon: 'Monitor',
    category: 'system',
    description: 'Sessoes ativas de usuario',

    hiddenFields: ['tokenHash', 'refreshTokenHash', 'ipAddress', 'deviceFingerprint'],
    maskedFields: [],
    readOnlyFields: ['id', 'userId', 'tenantId', 'createdAt', 'updatedAt'],

    searchableFields: ['deviceName', 'browser', 'os'],
    defaultSortField: 'createdAt',
    defaultSortOrder: 'desc',

    titleField: 'deviceName',
    subtitleField: 'browser',

    listColumns: [
      { field: 'id', label: 'ID', type: 'id', width: '80px', sortable: false, truncate: 8 },
      { field: 'deviceType', label: 'Dispositivo', type: 'enum', width: '120px', sortable: true },
      { field: 'browser', label: 'Browser', type: 'text', width: '100px', sortable: true },
      { field: 'os', label: 'OS', type: 'text', width: '100px', sortable: true },
      { field: 'isActive', label: 'Ativo', type: 'boolean', width: '60px', sortable: true },
      { field: 'lastActivityAt', label: 'Ultima Atividade', type: 'datetime', width: '160px', sortable: true },
      { field: 'expiresAt', label: 'Expira em', type: 'datetime', width: '160px', sortable: true },
      { field: 'createdAt', label: 'Criado', type: 'datetime', width: '160px', sortable: true },
    ],

    filters: [
      { field: 'isActive', label: 'Ativo', type: 'boolean' },
      { field: 'deviceType', label: 'Dispositivo', type: 'select',
        options: [
          { value: 'DESKTOP_APP', label: 'Desktop' },
          { value: 'WEB_BROWSER', label: 'Web' },
          { value: 'MOBILE_APP', label: 'Mobile' },
          { value: 'API_CLIENT', label: 'API' },
        ],
      },
      { field: 'createdAt', label: 'Criado em', type: 'date_range' },
    ],

    expandableRelations: ['user'],
    inlineRelations: [],

    allowEdit: false,
    allowDelete: false,
    allowHardDelete: false,

    exportable: false,
    maxExportRows: 0,
  },

  // ════════════════════ BILLING ════════════════════
  {
    prismaModel: 'UsageCounter',
    displayName: 'Uso',
    icon: 'BarChart3',
    category: 'billing',
    description: 'Contadores de uso por usuario/periodo',

    hiddenFields: [],
    maskedFields: [],
    readOnlyFields: ['id', 'userId'],

    searchableFields: ['period'],
    defaultSortField: 'period',
    defaultSortOrder: 'desc',

    titleField: 'period',

    listColumns: [
      { field: 'id', label: 'ID', type: 'id', width: '80px', sortable: false, truncate: 8 },
      { field: 'userId', label: 'Usuario', type: 'relation', width: '180px', sortable: false, relationModel: 'User', relationField: 'displayName' },
      { field: 'period', label: 'Periodo', type: 'text', width: '100px', sortable: true },
      { field: 'messages', label: 'Mensagens', type: 'number', width: '100px', sortable: true },
      { field: 'tokensIn', label: 'Tokens In', type: 'number', width: '100px', sortable: true },
      { field: 'tokensOut', label: 'Tokens Out', type: 'number', width: '100px', sortable: true },
      { field: 'byokMessages', label: 'BYOK Msgs', type: 'number', width: '100px', sortable: true },
    ],

    filters: [
      { field: 'period', label: 'Periodo', type: 'text', placeholder: '2026-02' },
    ],

    expandableRelations: ['user'],
    inlineRelations: [],

    allowEdit: false,
    allowDelete: false,
    allowHardDelete: false,

    exportable: true,
    maxExportRows: 10000,
  },

  {
    prismaModel: 'AiUsageDaily',
    displayName: 'Uso IA Diario',
    icon: 'TrendingUp',
    category: 'ai',
    description: 'Uso diario de IA por tenant/provider',

    hiddenFields: [],
    maskedFields: [],
    readOnlyFields: ['id', 'tenantId', 'createdAt', 'updatedAt'],

    searchableFields: ['provider', 'model'],
    defaultSortField: 'usageDate',
    defaultSortOrder: 'desc',

    titleField: 'provider',
    subtitleField: 'model',

    listColumns: [
      { field: 'id', label: 'ID', type: 'id', width: '80px', sortable: false, truncate: 8 },
      { field: 'provider', label: 'Provider', type: 'text', width: '100px', sortable: true },
      { field: 'model', label: 'Modelo', type: 'text', width: '150px', sortable: true },
      { field: 'usageDate', label: 'Data', type: 'date', width: '110px', sortable: true },
      { field: 'requestCount', label: 'Requests', type: 'number', width: '90px', sortable: true },
      { field: 'tokensInput', label: 'Tokens In', type: 'number', width: '90px', sortable: true },
      { field: 'tokensOutput', label: 'Tokens Out', type: 'number', width: '90px', sortable: true },
      { field: 'errorCount', label: 'Erros', type: 'number', width: '70px', sortable: true },
    ],

    filters: [
      { field: 'provider', label: 'Provider', type: 'text', placeholder: 'openai, google...' },
      { field: 'usageDate', label: 'Data', type: 'date_range' },
    ],

    expandableRelations: ['tenant'],
    inlineRelations: [],

    allowEdit: false,
    allowDelete: false,
    allowHardDelete: false,

    exportable: true,
    maxExportRows: 50000,
  },

  {
    prismaModel: 'WebhookLog',
    displayName: 'Webhook Logs',
    icon: 'Webhook',
    category: 'integrations',
    description: 'Logs de entrega de webhooks',

    hiddenFields: [],
    maskedFields: [],
    readOnlyFields: ['id', 'endpointId', 'createdAt'],

    searchableFields: ['event'],
    defaultSortField: 'createdAt',
    defaultSortOrder: 'desc',

    titleField: 'event',

    listColumns: [
      { field: 'id', label: 'ID', type: 'id', width: '80px', sortable: false, truncate: 8 },
      { field: 'event', label: 'Evento', type: 'text', width: '200px', sortable: true },
      { field: 'statusCode', label: 'Status', type: 'number', width: '80px', sortable: true },
      { field: 'deliveredAt', label: 'Entregue', type: 'datetime', width: '160px', sortable: true },
      { field: 'createdAt', label: 'Criado', type: 'datetime', width: '160px', sortable: true },
    ],

    filters: [
      { field: 'event', label: 'Evento', type: 'text', placeholder: 'message.created' },
      { field: 'createdAt', label: 'Periodo', type: 'date_range' },
    ],

    expandableRelations: ['endpoint'],
    inlineRelations: [],

    allowEdit: false,
    allowDelete: false,
    allowHardDelete: false,

    exportable: true,
    maxExportRows: 50000,
  },

  {
    prismaModel: 'KbArticle',
    displayName: 'Artigos KB',
    icon: 'BookOpen',
    category: 'ai',
    description: 'Artigos da base de conhecimento',

    hiddenFields: [],
    maskedFields: [],
    readOnlyFields: ['id', 'userId', 'createdAt', 'updatedAt'],

    searchableFields: ['title', 'slug', 'summary', 'content'],
    defaultSortField: 'createdAt',
    defaultSortOrder: 'desc',

    titleField: 'title',
    subtitleField: 'status',

    listColumns: [
      { field: 'id', label: 'ID', type: 'id', width: '80px', sortable: false, truncate: 8 },
      { field: 'title', label: 'Titulo', type: 'text', width: '250px', sortable: true, truncate: 60 },
      { field: 'status', label: 'Status', type: 'enum', width: '100px', sortable: true,
        enumColors: { DRAFT: '#F9CA24', PUBLISHED: '#00B894', ARCHIVED: '#9090A0' },
      },
      { field: 'difficulty', label: 'Dificuldade', type: 'enum', width: '110px', sortable: true },
      { field: 'viewCount', label: 'Views', type: 'number', width: '70px', sortable: true },
      { field: 'helpfulCount', label: 'Util', type: 'number', width: '60px', sortable: true },
      { field: 'createdAt', label: 'Criado', type: 'datetime', width: '160px', sortable: true },
    ],

    filters: [
      { field: 'status', label: 'Status', type: 'select',
        options: [
          { value: 'DRAFT', label: 'Rascunho' },
          { value: 'PUBLISHED', label: 'Publicado' },
          { value: 'ARCHIVED', label: 'Arquivado' },
        ],
      },
      { field: 'difficulty', label: 'Dificuldade', type: 'select',
        options: [
          { value: 'BASIC', label: 'Basico' },
          { value: 'INTERMEDIATE', label: 'Intermediario' },
          { value: 'ADVANCED', label: 'Avancado' },
        ],
      },
      { field: 'createdAt', label: 'Criado em', type: 'date_range' },
    ],

    expandableRelations: ['attachments', 'category'],
    inlineRelations: ['user'],

    allowEdit: false,
    allowDelete: false,
    allowHardDelete: false,

    exportable: true,
    maxExportRows: 10000,
  },
];

export function getModelConfig(modelName: string): ModelConfig | undefined {
  return MODEL_REGISTRY.find(
    (m) => m.prismaModel.toLowerCase() === modelName.toLowerCase()
  );
}

export function getModelConfigOrFail(modelName: string): ModelConfig {
  const config = getModelConfig(modelName);
  if (!config) {
    throw new Error(`Model "${modelName}" not found in registry`);
  }
  return config;
}
