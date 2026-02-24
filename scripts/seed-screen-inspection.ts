/**
 * Seed script for Screen Inspection Engine data
 *
 * Seeds:
 * - Built-in error patterns in error_pattern_library
 * - Sample screen_inspection_log entries for testing/demo
 *
 * Usage:
 *   npx tsx scripts/seed-screen-inspection.ts
 *   npx tsx scripts/seed-screen-inspection.ts --tenant-id <uuid>
 */

import { randomUUID } from 'crypto';

// ── Built-in Error Patterns ────────────────────────────────────────────────

interface BuiltinPattern {
  name: string;
  description: string;
  category: string;
  softwareIds: string[];
  regexPattern: string;
  regexFlags: string;
  codeExtractRegex: string | null;
  defaultSeverity: string;
  knownCodes: Record<string, string>;
  kbSearchTerms: string[];
  priorityOrder: number;
}

const BUILTIN_PATTERNS: BuiltinPattern[] = [
  // SEFAZ
  {
    name: 'Rejeição SEFAZ',
    description: 'Nota fiscal rejeitada pela SEFAZ com código de rejeição',
    category: 'sefaz',
    softwareIds: ['jposto', 'jnotas', 'sefaz_portal'],
    regexPattern: 'rejei[çc][aã]o\\s*:?\\s*(\\d{3})',
    regexFlags: 'i',
    codeExtractRegex: '(\\d{3})',
    defaultSeverity: 'high',
    knownCodes: {
      '204': 'Duplicidade de NF-e',
      '205': 'NF-e já autorizada',
      '206': 'NF-e já cancelada',
      '213': 'CNPJ emitente não cadastrado',
      '215': 'Falha no Schema XML',
      '233': 'IE do destinatário não informada',
      '301': 'Irregularidade fiscal do emitente',
      '302': 'Irregularidade fiscal do destinatário',
      '539': 'Duplicidade de NF-e com diferença na chave de acesso',
      '656': 'Consumo indevido',
      '999': 'Erro não catalogado',
    },
    kbSearchTerms: ['rejeição sefaz', 'nfe rejeitada'],
    priorityOrder: 10,
  },
  {
    name: 'Status SEFAZ (cStat)',
    description: 'Código de status retornado pela SEFAZ',
    category: 'sefaz',
    softwareIds: ['jposto', 'jnotas', 'sefaz_portal'],
    regexPattern: 'cStat[:\\s=]*(\\d{3})',
    regexFlags: 'i',
    codeExtractRegex: '(\\d{3})',
    defaultSeverity: 'high',
    knownCodes: {},
    kbSearchTerms: ['cstat sefaz', 'status nfe'],
    priorityOrder: 11,
  },
  {
    name: 'Timeout SEFAZ',
    description: 'Comunicação com SEFAZ expirou',
    category: 'sefaz',
    softwareIds: ['jposto', 'jnotas'],
    regexPattern: '(?:timeout|tempo\\s+esgotado|sem\\s+resposta).*sefaz',
    regexFlags: 'i',
    codeExtractRegex: null,
    defaultSeverity: 'high',
    knownCodes: {},
    kbSearchTerms: ['timeout sefaz', 'sefaz sem resposta', 'contingência'],
    priorityOrder: 12,
  },

  // Certificados
  {
    name: 'Certificado Digital Vencido',
    description: 'O certificado digital está expirado',
    category: 'certificate',
    softwareIds: [],
    regexPattern: 'certificado.*(?:vencido|expirado|expired)|(?:expired|vencido).*certificado',
    regexFlags: 'i',
    codeExtractRegex: null,
    defaultSeverity: 'critical',
    knownCodes: {},
    kbSearchTerms: ['certificado vencido', 'renovar certificado digital'],
    priorityOrder: 20,
  },
  {
    name: 'Certificado Não Encontrado',
    description: 'Certificado digital não foi localizado no sistema',
    category: 'certificate',
    softwareIds: [],
    regexPattern: 'certificado.*n[aã]o\\s+encontrado|n[aã]o.*certificado|no\\s+certificate',
    regexFlags: 'i',
    codeExtractRegex: null,
    defaultSeverity: 'critical',
    knownCodes: {},
    kbSearchTerms: ['certificado não encontrado', 'instalar certificado'],
    priorityOrder: 21,
  },
  {
    name: 'Erro na Cadeia de Certificação',
    description: 'Problema na cadeia de confiança do certificado',
    category: 'certificate',
    softwareIds: [],
    regexPattern: 'cadeia.*certifica|certificate\\s+chain|trust\\s+chain|ca\\s+raiz',
    regexFlags: 'i',
    codeExtractRegex: null,
    defaultSeverity: 'high',
    knownCodes: {},
    kbSearchTerms: ['cadeia certificação', 'CA raiz'],
    priorityOrder: 22,
  },

  // Banco de Dados
  {
    name: 'Falha na Conexão com Banco de Dados',
    description: 'Não foi possível conectar ao servidor de banco de dados',
    category: 'database',
    softwareIds: [],
    regexPattern: '(?:connection\\s+refused|conex[aã]o\\s+recusada|could\\s+not\\s+connect).*(?:database|banco|db|postgres|mysql|sql)',
    regexFlags: 'i',
    codeExtractRegex: null,
    defaultSeverity: 'critical',
    knownCodes: {},
    kbSearchTerms: ['conexão banco dados', 'database connection refused'],
    priorityOrder: 30,
  },
  {
    name: 'Deadlock no Banco de Dados',
    description: 'Deadlock detectado no banco de dados',
    category: 'database',
    softwareIds: [],
    regexPattern: 'deadlock|impasse.*(?:banco|db)|lock\\s+timeout',
    regexFlags: 'i',
    codeExtractRegex: null,
    defaultSeverity: 'high',
    knownCodes: {},
    kbSearchTerms: ['deadlock banco dados', 'lock timeout database'],
    priorityOrder: 31,
  },

  // Rede
  {
    name: 'Erro de DNS',
    description: 'Falha na resolução de nome de domínio',
    category: 'network',
    softwareIds: [],
    regexPattern: '(?:dns|name\\s+resolution).*(?:fail|error|falha)|ERR_NAME_NOT_RESOLVED',
    regexFlags: 'i',
    codeExtractRegex: null,
    defaultSeverity: 'high',
    knownCodes: {},
    kbSearchTerms: ['erro dns', 'name not resolved'],
    priorityOrder: 40,
  },
  {
    name: 'Timeout de Conexão',
    description: 'A conexão de rede expirou',
    category: 'network',
    softwareIds: [],
    regexPattern: '(?:connection|conex[aã]o).*(?:timed?\\s*out|tempo.*esgot)|ERR_CONNECTION_TIMED_OUT',
    regexFlags: 'i',
    codeExtractRegex: null,
    defaultSeverity: 'high',
    knownCodes: {},
    kbSearchTerms: ['connection timeout', 'tempo esgotado conexão'],
    priorityOrder: 41,
  },
  {
    name: 'Erro HTTP',
    description: 'Erro de comunicação HTTP',
    category: 'network',
    softwareIds: [],
    regexPattern: '(?:HTTP|status)\\s*(?:erro?r?\\s*)?(?:code\\s*)?:?\\s*(4\\d{2}|5\\d{2})',
    regexFlags: 'i',
    codeExtractRegex: '(4\\d{2}|5\\d{2})',
    defaultSeverity: 'medium',
    knownCodes: {
      '400': 'Bad Request',
      '401': 'Unauthorized',
      '403': 'Forbidden',
      '404': 'Not Found',
      '500': 'Internal Server Error',
      '502': 'Bad Gateway',
      '503': 'Service Unavailable',
    },
    kbSearchTerms: ['erro http', 'status code'],
    priorityOrder: 42,
  },

  // Impressão
  {
    name: 'Erro no Spooler de Impressão',
    description: 'O serviço de spooler de impressão está com problemas',
    category: 'printing',
    softwareIds: ['printer_dialog'],
    regexPattern: 'spooler.*(?:parado|stopped|erro|error)|(?:erro|error).*spooler',
    regexFlags: 'i',
    codeExtractRegex: null,
    defaultSeverity: 'medium',
    knownCodes: {},
    kbSearchTerms: ['spooler impressão parado', 'reiniciar spooler'],
    priorityOrder: 50,
  },
  {
    name: 'Impressora Offline',
    description: 'A impressora está offline ou indisponível',
    category: 'printing',
    softwareIds: ['printer_dialog'],
    regexPattern: 'impressora.*(?:offline|desligada|indispon[ií]vel)|printer.*offline',
    regexFlags: 'i',
    codeExtractRegex: null,
    defaultSeverity: 'medium',
    knownCodes: {},
    kbSearchTerms: ['impressora offline', 'impressora indisponível'],
    priorityOrder: 51,
  },

  // Windows
  {
    name: 'Tela Azul (BSOD)',
    description: 'Erro crítico do Windows — tela azul da morte',
    category: 'windows',
    softwareIds: [],
    regexPattern: '(?:blue\\s+screen|tela\\s+azul|BSOD|STOP\\s+error|CRITICAL_PROCESS_DIED)',
    regexFlags: 'i',
    codeExtractRegex: null,
    defaultSeverity: 'critical',
    knownCodes: {},
    kbSearchTerms: ['tela azul windows', 'BSOD'],
    priorityOrder: 60,
  },

  // Genéricos
  {
    name: 'Erro Genérico',
    description: 'Mensagem de erro genérica detectada na tela',
    category: 'generic',
    softwareIds: [],
    regexPattern: '(?:^|\\s)(?:erro|error)\\s*:?\\s*(.{5,80})',
    regexFlags: 'im',
    codeExtractRegex: null,
    defaultSeverity: 'medium',
    knownCodes: {},
    kbSearchTerms: ['erro'],
    priorityOrder: 90,
  },
  {
    name: 'Acesso Negado',
    description: 'Permissão de acesso negada',
    category: 'generic',
    softwareIds: [],
    regexPattern: '(?:acesso\\s+negado|access\\s+denied|permiss[aã]o\\s+negada|permission\\s+denied)',
    regexFlags: 'i',
    codeExtractRegex: null,
    defaultSeverity: 'medium',
    knownCodes: {},
    kbSearchTerms: ['acesso negado', 'permissão negada'],
    priorityOrder: 91,
  },
];

// ── Sample Inspection Logs ─────────────────────────────────────────────────

interface SampleLog {
  detectedSoftware: string;
  detectedSoftwareVersion: string | null;
  windowTitle: string;
  errorsDetected: Array<{ text: string; code?: string; severity: string; source: string }>;
  detectionSource: string;
  kbMatches: Array<{ title: string; matchType: string; relevanceScore: number }>;
  userAction: string | null;
  wasHelpful: boolean | null;
  pipelineDurationMs: number;
  ocrDurationMs: number;
  diffChangePct: number;
  visionApiUsed: boolean;
}

const SAMPLE_LOGS: SampleLog[] = [
  {
    detectedSoftware: 'JPosto',
    detectedSoftwareVersion: '4.2.1',
    windowTitle: 'JPosto - Gestão de Postos',
    errorsDetected: [
      { text: 'Rejeição: 204 - Duplicidade de NF-e', code: '204', severity: 'high', source: 'sefaz_rejeicao' },
    ],
    detectionSource: 'ocr',
    kbMatches: [{ title: 'Como resolver rejeição 204 no JPosto', matchType: 'exact_code', relevanceScore: 0.95 }],
    userAction: 'opened_kb',
    wasHelpful: true,
    pipelineDurationMs: 1800,
    ocrDurationMs: 1200,
    diffChangePct: 0.15,
    visionApiUsed: false,
  },
  {
    detectedSoftware: 'JNotas',
    detectedSoftwareVersion: '3.1.0',
    windowTitle: 'JNotas - Emissão de Notas Fiscais',
    errorsDetected: [
      { text: 'Certificado digital vencido em 15/01/2026', severity: 'critical', source: 'cert_expired' },
    ],
    detectionSource: 'ocr',
    kbMatches: [{ title: 'Renovação de certificado digital A1/A3', matchType: 'keyword', relevanceScore: 0.88 }],
    userAction: 'asked_ai',
    wasHelpful: true,
    pipelineDurationMs: 2100,
    ocrDurationMs: 1400,
    diffChangePct: 0.22,
    visionApiUsed: false,
  },
  {
    detectedSoftware: 'TOTVS Protheus',
    detectedSoftwareVersion: '12.1.33',
    windowTitle: 'TOTVS Protheus - SmartClient',
    errorsDetected: [
      { text: 'Connection refused: banco de dados PostgreSQL', severity: 'critical', source: 'db_connection' },
    ],
    detectionSource: 'ocr',
    kbMatches: [{ title: 'Verificar serviço PostgreSQL para Protheus', matchType: 'keyword', relevanceScore: 0.82 }],
    userAction: 'copied_error',
    wasHelpful: null,
    pipelineDurationMs: 1600,
    ocrDurationMs: 1100,
    diffChangePct: 0.45,
    visionApiUsed: false,
  },
  {
    detectedSoftware: 'Google Chrome',
    detectedSoftwareVersion: null,
    windowTitle: 'Google Chrome',
    errorsDetected: [
      { text: 'ERR_NAME_NOT_RESOLVED', severity: 'high', source: 'dns_error' },
    ],
    detectionSource: 'ocr',
    kbMatches: [{ title: 'Resolver problemas de DNS no Windows', matchType: 'keyword', relevanceScore: 0.75 }],
    userAction: 'dismissed',
    wasHelpful: false,
    pipelineDurationMs: 1300,
    ocrDurationMs: 900,
    diffChangePct: 0.35,
    visionApiUsed: false,
  },
  {
    detectedSoftware: 'Diálogo de Impressão',
    detectedSoftwareVersion: null,
    windowTitle: 'Imprimir',
    errorsDetected: [
      { text: 'Spooler de impressão parado', severity: 'medium', source: 'print_spooler' },
    ],
    detectionSource: 'both',
    kbMatches: [{ title: 'Como reiniciar o spooler de impressão', matchType: 'keyword', relevanceScore: 0.92 }],
    userAction: 'opened_kb',
    wasHelpful: true,
    pipelineDurationMs: 2800,
    ocrDurationMs: 1500,
    diffChangePct: 0.12,
    visionApiUsed: true,
  },
];

// ── SQL Generation ─────────────────────────────────────────────────────────

function generatePatternInserts(): string {
  const values = BUILTIN_PATTERNS.map((p) => {
    const id = randomUUID();
    return `  ('${id}', NULL, '${esc(p.name)}', '${esc(p.description)}', '${p.category}', '${JSON.stringify(p.softwareIds)}'::jsonb, '${esc(p.regexPattern)}', '${p.regexFlags}', ${p.codeExtractRegex ? `'${esc(p.codeExtractRegex)}'` : 'NULL'}, '${p.defaultSeverity}', '${JSON.stringify(p.knownCodes)}'::jsonb, '${JSON.stringify(p.kbSearchTerms)}'::jsonb, true, true, ${p.priorityOrder}, 0, NULL, 0, NULL, NOW(), NOW())`;
  });

  return `-- Seed: Built-in Error Patterns for Screen Inspection Engine
INSERT INTO error_pattern_library (
  id, tenant_id, name, description, category, software_ids,
  regex_pattern, regex_flags, code_extract_regex,
  default_severity, known_codes, kb_search_terms,
  is_builtin, is_active, priority_order,
  total_detections, last_detected_at, total_kb_matches,
  created_by, created_at, updated_at
) VALUES
${values.join(',\n')}
ON CONFLICT DO NOTHING;`;
}

function generateLogInserts(tenantId: string, userId: string): string {
  const values = SAMPLE_LOGS.map((log) => {
    const id = randomUUID();
    const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
    return `  ('${id}', '${tenantId}', '${userId}', '${esc(log.detectedSoftware)}', ${log.detectedSoftwareVersion ? `'${log.detectedSoftwareVersion}'` : 'NULL'}, '${esc(log.windowTitle)}', '${JSON.stringify(log.errorsDetected)}'::jsonb, ${log.errorsDetected.length}, '${log.detectionSource}', '${JSON.stringify(log.kbMatches)}'::jsonb, ${log.kbMatches.length}, ${log.userAction ? `'${log.userAction}'` : 'NULL'}, ${log.userAction ? `'${createdAt}'` : 'NULL'}, ${log.wasHelpful !== null ? log.wasHelpful : 'NULL'}, ${log.pipelineDurationMs}, ${log.ocrDurationMs}, ${log.diffChangePct}, ${log.visionApiUsed}, 0, NULL, NULL, '${createdAt}')`;
  });

  return `-- Seed: Sample Screen Inspection Logs
INSERT INTO screen_inspection_log (
  id, tenant_id, user_id, detected_software, detected_software_version,
  window_title, errors_detected, error_count, detection_source,
  kb_matches, kb_match_count, user_action, user_action_at, was_helpful,
  pipeline_duration_ms, ocr_duration_ms, diff_change_pct,
  vision_api_used, vision_api_cost_usd, external_ticket_id,
  connector_id, created_at
) VALUES
${values.join(',\n')}
ON CONFLICT DO NOTHING;`;
}

function esc(s: string): string {
  return s.replace(/'/g, "''");
}

// ── Main ───────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const tenantIdArg = args.indexOf('--tenant-id');
const tenantId = tenantIdArg >= 0 ? args[tenantIdArg + 1] : randomUUID();
const userId = randomUUID();

console.log('-- ═══════════════════════════════════════════════════');
console.log('-- Screen Inspection Engine — Seed Data');
console.log(`-- Tenant ID: ${tenantId}`);
console.log(`-- User ID:   ${userId}`);
console.log('-- ═══════════════════════════════════════════════════');
console.log();
console.log(generatePatternInserts());
console.log();
console.log(generateLogInserts(tenantId, userId));
console.log();
console.log('-- Done.');
