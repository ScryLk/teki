// ═══════════════════════════════════════════════════════════════════
// Term Maps — Multilingual Technical Term Translation
// ═══════════════════════════════════════════════════════════════════
//
// Mapas de tradução de termos técnicos brasileiros (PT-BR) para 7
// idiomas. Usados pela Layer 2 do pipeline de Query Expansion para
// gerar buscas multilíngues na base de conhecimento.
//
// Cada mapa traduz termos comuns em suporte técnico fiscal/ERP
// para o idioma alvo, incluindo sinônimos e variações.
// ═══════════════════════════════════════════════════════════════════

/** Mapa de tradução de termos para um idioma específico */
export interface TermMap {
  language: string;
  terms: Record<string, string[]>;
}

/** Informações de um idioma de fallback */
export interface FallbackLanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

// ─── Fallback Languages ─────────────────────────────────────────

export const FALLBACK_LANGUAGES: FallbackLanguageInfo[] = [
  { code: 'en', name: 'Inglês', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Espanhol', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Alemão', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Francês', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'ja', name: 'Japonês', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinês', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ko', name: 'Coreano', nativeName: '한국어', flag: '🇰🇷' },
];

// ─── Term Maps ──────────────────────────────────────────────────

export const TERM_MAPS: Record<string, TermMap> = {
  en: {
    language: 'English',
    terms: {
      // Documentos Fiscais
      'NFe': ['electronic invoice', 'e-invoice', 'NFe'],
      'NF-e': ['electronic invoice', 'e-invoice', 'NF-e'],
      'nota fiscal': ['invoice', 'fiscal document', 'tax document'],
      'nota fiscal eletrônica': ['electronic invoice', 'e-invoice', 'digital invoice'],
      'NFCe': ['consumer electronic invoice', 'NFCe', 'retail e-invoice'],
      'NFS-e': ['electronic service invoice', 'service e-invoice', 'NFS-e'],
      'CTe': ['electronic transport document', 'CTe', 'transport invoice'],
      'MDF-e': ['electronic manifest', 'MDF-e', 'transport manifest'],
      'DANFE': ['DANFE', 'invoice print', 'auxiliary document'],

      // Operações
      'transmissão': ['transmission', 'submission', 'upload', 'sending'],
      'rejeição': ['rejection', 'error', 'refused', 'denied'],
      'cancelamento': ['cancellation', 'void', 'cancel'],
      'inutilização': ['invalidation', 'number gap', 'void range'],
      'contingência': ['contingency', 'offline mode', 'fallback mode'],
      'consulta': ['query', 'lookup', 'check', 'inquiry'],
      'autorização': ['authorization', 'approval', 'validation'],
      'retorno': ['return', 'response', 'callback'],
      'lote': ['batch', 'lot', 'bulk'],
      'evento': ['event', 'occurrence'],
      'carta de correção': ['correction letter', 'amendment letter'],

      // Infraestrutura
      'certificado digital': ['digital certificate', 'SSL certificate', 'TLS certificate'],
      'certificado A1': ['A1 certificate', 'software certificate', 'PKCS12 certificate'],
      'certificado A3': ['A3 certificate', 'hardware token', 'smart card certificate'],
      'webservice': ['web service', 'SOAP service', 'API endpoint'],
      'SEFAZ': ['tax authority', 'SEFAZ', 'fiscal authority', 'state tax office'],
      'ambiente de homologação': ['test environment', 'staging', 'sandbox', 'homologation'],
      'ambiente de produção': ['production environment', 'live environment'],

      // Erros e Problemas
      'timeout': ['timeout', 'connection timeout', 'request timeout'],
      'schema': ['XML schema', 'XSD validation', 'schema validation'],
      'assinatura digital': ['digital signature', 'XML signature', 'XMLDSig'],
      'validação': ['validation', 'verification', 'check'],
      'erro de conexão': ['connection error', 'network error', 'connectivity issue'],
      'certificado expirado': ['expired certificate', 'certificate expiration'],
      'certificado revogado': ['revoked certificate', 'certificate revocation'],

      // ERP / Software
      'integração': ['integration', 'connector', 'plugin'],
      'banco de dados': ['database', 'DB'],
      'backup': ['backup', 'data backup'],
      'atualização': ['update', 'upgrade', 'patch'],
      'configuração': ['configuration', 'setup', 'settings'],
      'parâmetro': ['parameter', 'setting', 'config option'],
      'log': ['log', 'log file', 'event log'],
      'permissão': ['permission', 'access rights', 'privilege'],
    },
  },

  es: {
    language: 'Español',
    terms: {
      'NFe': ['factura electrónica', 'e-factura', 'NFe'],
      'nota fiscal': ['factura', 'documento fiscal'],
      'transmissão': ['transmisión', 'envío'],
      'rejeição': ['rechazo', 'error', 'denegación'],
      'cancelamento': ['cancelación', 'anulación'],
      'contingência': ['contingencia', 'modo fuera de línea'],
      'certificado digital': ['certificado digital', 'certificado SSL'],
      'SEFAZ': ['autoridad tributaria', 'SEFAZ', 'hacienda estatal'],
      'consulta': ['consulta', 'verificación'],
      'inutilização': ['inutilización', 'anulación de rango'],
      'webservice': ['servicio web', 'API'],
      'assinatura digital': ['firma digital', 'firma electrónica'],
      'validação': ['validación', 'verificación'],
      'configuração': ['configuración', 'ajustes'],
      'integração': ['integración', 'conector'],
      'banco de dados': ['base de datos', 'BD'],
      'atualização': ['actualización', 'parche'],
      'permissão': ['permiso', 'derecho de acceso'],
    },
  },

  de: {
    language: 'Deutsch',
    terms: {
      'NFe': ['elektronische Rechnung', 'E-Rechnung', 'NFe'],
      'nota fiscal': ['Rechnung', 'Steuerdokument', 'Fiskalbeleg'],
      'transmissão': ['Übertragung', 'Übermittlung', 'Sendung'],
      'rejeição': ['Ablehnung', 'Fehler', 'Zurückweisung'],
      'cancelamento': ['Stornierung', 'Annullierung'],
      'contingência': ['Notfallmodus', 'Offline-Modus'],
      'certificado digital': ['digitales Zertifikat', 'SSL-Zertifikat'],
      'SEFAZ': ['Steuerbehörde', 'SEFAZ', 'Finanzamt'],
      'consulta': ['Abfrage', 'Prüfung', 'Anfrage'],
      'webservice': ['Webservice', 'Webdienst', 'SOAP-Dienst'],
      'validação': ['Validierung', 'Prüfung'],
      'configuração': ['Konfiguration', 'Einstellungen'],
      'integração': ['Integration', 'Anbindung', 'Schnittstelle'],
      'banco de dados': ['Datenbank', 'DB'],
      // SAP-specific terms (common in DE documentation)
      'SAP': ['SAP ERP', 'SAP Business One', 'SAP S/4HANA'],
      'IDOC': ['IDoc', 'Intermediate Document', 'SAP IDoc'],
      'RFC': ['RFC', 'Remote Function Call', 'SAP RFC'],
      'BAPI': ['BAPI', 'Business API', 'SAP BAPI'],
      'atualização': ['Aktualisierung', 'Update', 'Patch'],
      'permissão': ['Berechtigung', 'Zugriffsrecht'],
    },
  },

  fr: {
    language: 'Français',
    terms: {
      'NFe': ['facture électronique', 'e-facture', 'NFe'],
      'nota fiscal': ['facture', 'document fiscal'],
      'transmissão': ['transmission', 'envoi'],
      'rejeição': ['rejet', 'erreur', 'refus'],
      'cancelamento': ['annulation', 'résiliation'],
      'contingência': ['mode de secours', 'mode hors ligne'],
      'certificado digital': ['certificat numérique', 'certificat SSL'],
      'SEFAZ': ['autorité fiscale', 'SEFAZ', 'administration fiscale'],
      'consulta': ['consultation', 'vérification', 'requête'],
      'webservice': ['service web', 'API'],
      'validação': ['validation', 'vérification'],
      'configuração': ['configuration', 'paramétrage'],
      'integração': ['intégration', 'connecteur'],
      'banco de dados': ['base de données', 'BDD'],
      'assinatura digital': ['signature numérique', 'signature électronique'],
      'atualização': ['mise à jour', 'correctif'],
      'permissão': ['permission', 'droit d\'accès'],
    },
  },

  ja: {
    language: '日本語',
    terms: {
      'NFe': ['電子請求書', 'e-invoice', 'NFe'],
      'nota fiscal': ['請求書', '税務書類'],
      'transmissão': ['送信', '伝送', 'アップロード'],
      'rejeição': ['拒否', 'エラー', '却下'],
      'cancelamento': ['キャンセル', '取消'],
      'certificado digital': ['デジタル証明書', 'SSL証明書', '電子証明書'],
      'SEFAZ': ['税務当局', 'SEFAZ'],
      'consulta': ['照会', '問い合わせ', '検索'],
      'webservice': ['Webサービス', 'ウェブサービス', 'API'],
      'validação': ['検証', 'バリデーション'],
      'configuração': ['設定', 'コンフィグ'],
      'integração': ['統合', '連携', 'インテグレーション'],
      'banco de dados': ['データベース', 'DB'],
      'atualização': ['更新', 'アップデート'],
      'permissão': ['権限', 'アクセス権'],
    },
  },

  zh: {
    language: '中文',
    terms: {
      'NFe': ['电子发票', 'e-invoice', 'NFe'],
      'nota fiscal': ['发票', '税务文件'],
      'transmissão': ['传输', '发送', '上传'],
      'rejeição': ['拒绝', '错误', '驳回'],
      'cancelamento': ['取消', '作废'],
      'certificado digital': ['数字证书', 'SSL证书', '电子证书'],
      'SEFAZ': ['税务机关', 'SEFAZ'],
      'consulta': ['查询', '检索', '查看'],
      'webservice': ['Web服务', '网络服务', 'API'],
      'validação': ['验证', '校验'],
      'configuração': ['配置', '设置'],
      'integração': ['集成', '对接', '整合'],
      'banco de dados': ['数据库', 'DB'],
      'atualização': ['更新', '升级', '补丁'],
      'permissão': ['权限', '访问权限'],
    },
  },

  ko: {
    language: '한국어',
    terms: {
      'NFe': ['전자 송장', 'e-invoice', 'NFe'],
      'nota fiscal': ['송장', '세금 문서'],
      'transmissão': ['전송', '송신', '업로드'],
      'rejeição': ['거부', '오류', '반려'],
      'cancelamento': ['취소', '무효화'],
      'certificado digital': ['디지털 인증서', 'SSL 인증서', '전자 인증서'],
      'SEFAZ': ['세무 당국', 'SEFAZ'],
      'consulta': ['조회', '검색', '문의'],
      'webservice': ['웹 서비스', 'API'],
      'validação': ['검증', '유효성 검사'],
      'configuração': ['구성', '설정'],
      'integração': ['통합', '연동', '인터페이스'],
      'banco de dados': ['데이터베이스', 'DB'],
      'atualização': ['업데이트', '패치'],
      'permissão': ['권한', '접근 권한'],
    },
  },
};

// ─── Smart Term Filter ──────────────────────────────────────────

/**
 * Filtra e retorna apenas os termos relevantes para a query fornecida.
 * Usado pela Layer 2 do pipeline para injetar termos traduzidos no prompt.
 *
 * Procura matchs parciais e case-insensitive entre a query e as chaves
 * do mapa de termos do idioma especificado.
 */
export function getRelevantTerms(query: string, languageCode: string): string {
  const termMap = TERM_MAPS[languageCode];
  if (!termMap) return '';

  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);

  const relevantEntries: string[] = [];

  for (const [ptTerm, translations] of Object.entries(termMap.terms)) {
    const ptLower = ptTerm.toLowerCase();

    // Match if: query contains the term, or term contains a query word (3+ chars)
    const isRelevant =
      queryLower.includes(ptLower) ||
      ptLower.includes(queryLower) ||
      queryWords.some(w => w.length >= 3 && (ptLower.includes(w) || w.includes(ptLower)));

    if (isRelevant) {
      relevantEntries.push(`- ${ptTerm} → ${translations.map(t => `"${t}"`).join(', ')}`);
    }
  }

  if (relevantEntries.length === 0) {
    // Fallback: include top 5 most common terms
    const commonTerms = ['NFe', 'nota fiscal', 'rejeição', 'certificado digital', 'SEFAZ'];
    for (const term of commonTerms) {
      const translations = termMap.terms[term];
      if (translations) {
        relevantEntries.push(`- ${term} → ${translations.map(t => `"${t}"`).join(', ')}`);
      }
    }
  }

  return relevantEntries.join('\n');
}

/**
 * Retorna informações de um idioma de fallback pelo código.
 */
export function getLanguageInfo(code: string): FallbackLanguageInfo | undefined {
  return FALLBACK_LANGUAGES.find(l => l.code === code);
}
