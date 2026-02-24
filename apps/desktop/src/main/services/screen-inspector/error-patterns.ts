import type { ErrorPattern, PotentialError, TextBlock, ErrorSeverity, ErrorCategory } from '@teki/shared';

// ═══════════════════════════════════════════════════════════════
// Built-in Error Pattern Library
// ═══════════════════════════════════════════════════════════════

export const ERROR_PATTERNS: ErrorPattern[] = [
  // ── SEFAZ / NF-e ──
  {
    id: 'sefaz_rejeicao',
    softwareIds: ['jposto', 'jnotas', 'sefaz_portal'],
    pattern: /rejei[çc][aã]o\s*:?\s*(\d{3})/i,
    extractCode: /(\d{3})/,
    severity: 'high',
    category: 'sefaz',
    title: 'Rejeição SEFAZ',
    description: 'Nota fiscal rejeitada pela SEFAZ',
    kbSearchTerms: ['rejeição sefaz', 'nfe rejeitada'],
    knownCodes: {
      '204': 'Duplicidade de NF-e',
      '205': 'NF-e já autorizada',
      '206': 'NF-e já cancelada',
      '213': 'CNPJ emitente não cadastrado',
      '215': 'Rejeição: Falha no Schema XML',
      '233': 'IE do destinatário não informada',
      '301': 'Irregularidade fiscal do emitente',
      '302': 'Irregularidade fiscal do destinatário',
      '539': 'Duplicidade de NF-e com diferença na chave de acesso',
      '656': 'Consumo indevido',
      '999': 'Erro não catalogado',
    },
  },
  {
    id: 'sefaz_cstat',
    softwareIds: ['jposto', 'jnotas', 'sefaz_portal'],
    pattern: /cStat[:\s=]*(\d{3})/i,
    extractCode: /(\d{3})/,
    severity: 'high',
    category: 'sefaz',
    title: 'Status SEFAZ (cStat)',
    description: 'Código de status retornado pela SEFAZ',
    kbSearchTerms: ['cstat sefaz', 'status nfe'],
  },
  {
    id: 'sefaz_timeout',
    softwareIds: ['jposto', 'jnotas'],
    pattern: /(?:timeout|tempo\s+esgotado|sem\s+resposta).*sefaz/i,
    severity: 'high',
    category: 'sefaz',
    title: 'Timeout SEFAZ',
    description: 'Comunicação com SEFAZ expirou',
    kbSearchTerms: ['timeout sefaz', 'sefaz sem resposta', 'contingência'],
  },
  {
    id: 'sefaz_xml',
    softwareIds: ['jposto', 'jnotas'],
    pattern: /(?:erro|falha|invalid).*xml.*(?:nfe|nota|sefaz)/i,
    severity: 'high',
    category: 'sefaz',
    title: 'Erro XML NF-e',
    description: 'Erro na estrutura do XML da nota fiscal',
    kbSearchTerms: ['erro xml nfe', 'schema xml nota fiscal'],
  },

  // ── Certificados ──
  {
    id: 'cert_expired',
    softwareIds: [],
    pattern: /certificado.*(?:vencido|expirado|expired)|(?:expired|vencido).*certificado/i,
    severity: 'critical',
    category: 'certificate',
    title: 'Certificado Digital Vencido',
    description: 'O certificado digital está expirado',
    kbSearchTerms: ['certificado vencido', 'renovar certificado digital', 'certificado expirado'],
  },
  {
    id: 'cert_not_found',
    softwareIds: [],
    pattern: /certificado.*n[aã]o\s+encontrado|n[aã]o.*certificado|no\s+certificate/i,
    severity: 'critical',
    category: 'certificate',
    title: 'Certificado Não Encontrado',
    description: 'Certificado digital não foi localizado no sistema',
    kbSearchTerms: ['certificado não encontrado', 'instalar certificado', 'A1 A3'],
  },
  {
    id: 'cert_chain',
    softwareIds: [],
    pattern: /cadeia.*certifica|certificate\s+chain|trust\s+chain|ca\s+raiz/i,
    severity: 'high',
    category: 'certificate',
    title: 'Erro na Cadeia de Certificação',
    description: 'Problema na cadeia de confiança do certificado',
    kbSearchTerms: ['cadeia certificação', 'CA raiz', 'instalar cadeia certificado'],
  },

  // ── Banco de Dados ──
  {
    id: 'db_connection',
    softwareIds: [],
    pattern: /(?:connection\s+refused|conex[aã]o\s+recusada|could\s+not\s+connect|n[aã]o\s+(?:foi\s+)?poss[ií]vel\s+conectar).*(?:database|banco|db|postgres|mysql|sql)/i,
    severity: 'critical',
    category: 'database',
    title: 'Falha na Conexão com Banco de Dados',
    description: 'Não foi possível conectar ao servidor de banco de dados',
    kbSearchTerms: ['conexão banco dados', 'database connection refused', 'servidor banco indisponível'],
  },
  {
    id: 'db_deadlock',
    softwareIds: [],
    pattern: /deadlock|impasse.*(?:banco|db)|lock\s+timeout/i,
    severity: 'high',
    category: 'database',
    title: 'Deadlock no Banco de Dados',
    description: 'Deadlock detectado no banco de dados',
    kbSearchTerms: ['deadlock banco dados', 'lock timeout database'],
  },
  {
    id: 'db_disk_full',
    softwareIds: [],
    pattern: /(?:disco\s+cheio|disk\s+full|espa[çc]o\s+insuficiente|no\s+space).*(?:banco|db|tablespace)/i,
    severity: 'critical',
    category: 'database',
    title: 'Disco Cheio (Banco de Dados)',
    description: 'Espaço insuficiente no servidor de banco de dados',
    kbSearchTerms: ['disco cheio banco dados', 'tablespace full', 'espaço insuficiente db'],
  },

  // ── Rede ──
  {
    id: 'dns_error',
    softwareIds: [],
    pattern: /(?:dns|name\s+resolution).*(?:fail|error|falha)|ERR_NAME_NOT_RESOLVED|could\s+not\s+resolve\s+host/i,
    severity: 'high',
    category: 'network',
    title: 'Erro de DNS',
    description: 'Falha na resolução de nome de domínio',
    kbSearchTerms: ['erro dns', 'name not resolved', 'falha resolução dns'],
  },
  {
    id: 'network_timeout',
    softwareIds: [],
    pattern: /(?:connection|conex[aã]o).*(?:timed?\s*out|tempo.*esgot)|ERR_CONNECTION_TIMED_OUT/i,
    severity: 'high',
    category: 'network',
    title: 'Timeout de Conexão',
    description: 'A conexão de rede expirou',
    kbSearchTerms: ['connection timeout', 'tempo esgotado conexão', 'rede lenta'],
  },
  {
    id: 'http_error',
    softwareIds: [],
    pattern: /(?:HTTP|status)\s*(?:erro?r?\s*)?(?:code\s*)?:?\s*(4\d{2}|5\d{2})/i,
    extractCode: /(4\d{2}|5\d{2})/,
    severity: 'medium',
    category: 'network',
    title: 'Erro HTTP',
    description: 'Erro de comunicação HTTP',
    kbSearchTerms: ['erro http', 'status code'],
    knownCodes: {
      '400': 'Bad Request',
      '401': 'Unauthorized',
      '403': 'Forbidden',
      '404': 'Not Found',
      '408': 'Request Timeout',
      '429': 'Too Many Requests',
      '500': 'Internal Server Error',
      '502': 'Bad Gateway',
      '503': 'Service Unavailable',
    },
  },

  // ── Impressão ──
  {
    id: 'print_spooler',
    softwareIds: ['printer_dialog'],
    pattern: /spooler.*(?:parado|stopped|erro|error)|(?:erro|error).*spooler/i,
    severity: 'medium',
    category: 'printing',
    title: 'Erro no Spooler de Impressão',
    description: 'O serviço de spooler de impressão está com problemas',
    kbSearchTerms: ['spooler impressão parado', 'reiniciar spooler', 'print spooler error'],
  },
  {
    id: 'printer_offline',
    softwareIds: ['printer_dialog'],
    pattern: /impressora.*(?:offline|desligada|indispon[ií]vel)|printer.*offline/i,
    severity: 'medium',
    category: 'printing',
    title: 'Impressora Offline',
    description: 'A impressora está offline ou indisponível',
    kbSearchTerms: ['impressora offline', 'impressora indisponível', 'reconectar impressora'],
  },

  // ── Windows ──
  {
    id: 'windows_bsod',
    softwareIds: [],
    pattern: /(?:blue\s+screen|tela\s+azul|BSOD|STOP\s+error|CRITICAL_PROCESS_DIED|KERNEL_DATA_INPAGE)/i,
    severity: 'critical',
    category: 'windows',
    title: 'Tela Azul (BSOD)',
    description: 'Erro crítico do Windows — tela azul da morte',
    kbSearchTerms: ['tela azul windows', 'BSOD', 'erro crítico windows'],
  },
  {
    id: 'windows_service',
    softwareIds: [],
    pattern: /servi[çc]o.*(?:parou|n[aã]o\s+inici|falhou|stopped|failed)|service.*(?:stopped|failed|could\s+not\s+start)/i,
    severity: 'high',
    category: 'windows',
    title: 'Erro em Serviço do Windows',
    description: 'Um serviço do Windows parou ou não conseguiu iniciar',
    kbSearchTerms: ['serviço windows parou', 'service failed to start'],
  },

  // ── Genéricos ──
  {
    id: 'generic_error',
    softwareIds: [],
    pattern: /(?:^|\s)(?:erro|error)\s*:?\s*(.{5,80})/im,
    severity: 'medium',
    category: 'generic',
    title: 'Erro Detectado',
    description: 'Mensagem de erro genérica detectada na tela',
    kbSearchTerms: ['erro'],
  },
  {
    id: 'generic_exception',
    softwareIds: [],
    pattern: /(?:exception|exceção|exce[çc][aã]o)\s*:?\s*(.{5,120})/im,
    severity: 'high',
    category: 'generic',
    title: 'Exceção Detectada',
    description: 'Exceção/exception detectada na tela',
    kbSearchTerms: ['exception', 'exceção'],
  },
  {
    id: 'generic_access_denied',
    softwareIds: [],
    pattern: /(?:acesso\s+negado|access\s+denied|permiss[aã]o\s+negada|permission\s+denied)/i,
    severity: 'medium',
    category: 'generic',
    title: 'Acesso Negado',
    description: 'Permissão de acesso negada',
    kbSearchTerms: ['acesso negado', 'permissão negada', 'access denied'],
  },
];

// ═══════════════════════════════════════════════════════════════
// Error Extractor
// ═══════════════════════════════════════════════════════════════

export class ErrorExtractor {
  private patterns: ErrorPattern[];
  private customPatterns: ErrorPattern[] = [];

  constructor(extraPatterns?: ErrorPattern[]) {
    this.patterns = [...ERROR_PATTERNS, ...(extraPatterns ?? [])];
  }

  addCustomPatterns(patterns: ErrorPattern[]): void {
    this.customPatterns = patterns;
  }

  extract(
    text: string,
    softwareId?: string,
    textBlocks?: TextBlock[]
  ): PotentialError[] {
    if (!text || text.trim().length < 3) return [];

    const allPatterns = [...this.patterns, ...this.customPatterns];
    const errors: PotentialError[] = [];
    const seenIds = new Set<string>();

    // Software-specific patterns first, then generic
    const sorted = allPatterns.sort((a, b) => {
      const aSpecific = a.softwareIds.length > 0 ? 0 : 1;
      const bSpecific = b.softwareIds.length > 0 ? 0 : 1;
      return aSpecific - bSpecific;
    });

    for (const pattern of sorted) {
      // If pattern is software-specific, only match if software matches
      if (
        pattern.softwareIds.length > 0 &&
        softwareId &&
        !pattern.softwareIds.includes(softwareId)
      ) {
        continue;
      }

      const match = text.match(pattern.pattern);
      if (!match) continue;

      // Avoid duplicate pattern IDs
      if (seenIds.has(pattern.id)) continue;
      seenIds.add(pattern.id);

      // Extract error code if pattern has extractCode
      let code: string | undefined;
      if (pattern.extractCode) {
        const codeMatch = match[0].match(pattern.extractCode);
        code = codeMatch?.[1] ?? codeMatch?.[0];
      }

      // Find bbox from text blocks
      const bbox = this.findBboxForMatch(match[0], textBlocks);

      // Build description with known code info
      let enrichedDescription = pattern.description;
      if (code && pattern.knownCodes?.[code]) {
        enrichedDescription += ` — ${code}: ${pattern.knownCodes[code]}`;
      }

      errors.push({
        id: `${pattern.id}_${Date.now()}`,
        text: match[0].trim().substring(0, 200),
        code,
        severity: pattern.severity,
        source: pattern.category === 'generic' ? 'generic' : pattern.id,
        bbox,
        softwareContext: softwareId,
      });
    }

    return errors;
  }

  getPatternById(id: string): ErrorPattern | undefined {
    return [...this.patterns, ...this.customPatterns].find((p) => p.id === id);
  }

  getKbSearchTerms(patternId: string, errorCode?: string): string[] {
    const pattern = this.getPatternById(patternId);
    if (!pattern) return [];

    const terms = [...pattern.kbSearchTerms];

    if (errorCode) {
      terms.push(errorCode);
      if (pattern.knownCodes?.[errorCode]) {
        terms.push(pattern.knownCodes[errorCode]);
      }
    }

    return terms;
  }

  private findBboxForMatch(
    matchText: string,
    textBlocks?: TextBlock[]
  ): { x0: number; y0: number; x1: number; y1: number } | undefined {
    if (!textBlocks?.length || !matchText) return undefined;

    const searchWords = matchText.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    if (!searchWords.length) return undefined;

    // Find the text block that best matches
    let bestBlock: TextBlock | undefined;
    let bestScore = 0;

    for (const block of textBlocks) {
      const blockLower = block.text.toLowerCase();
      const matchingWords = searchWords.filter((w) => blockLower.includes(w));
      const score = matchingWords.length / searchWords.length;

      if (score > bestScore) {
        bestScore = score;
        bestBlock = block;
      }
    }

    return bestBlock && bestScore > 0.3 ? bestBlock.bbox : undefined;
  }
}

export default ErrorExtractor;
