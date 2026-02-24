import type { DetectedSoftware, SoftwareSignature, ErrorCategory } from '@teki/shared';

// ═══════════════════════════════════════════════════════════════
// Software Signature Library
// ═══════════════════════════════════════════════════════════════

export const SOFTWARE_SIGNATURES: SoftwareSignature[] = [
  {
    id: 'jposto',
    name: 'JPosto',
    windowPatterns: [/jposto/i, /j-posto/i, /jpostoweb/i],
    ocrPatterns: [
      { pattern: /jposto/i, weight: 0.85 },
      { pattern: /abastecimento/i, weight: 0.5 },
      { pattern: /tanque|bomba|bico/i, weight: 0.4 },
    ],
    errorCategories: ['sefaz', 'certificate', 'database', 'printing'],
    versionPattern: /vers[aã]o\s*([\d.]+)/i,
  },
  {
    id: 'jnotas',
    name: 'JNotas',
    windowPatterns: [/jnotas/i, /j-notas/i],
    ocrPatterns: [
      { pattern: /jnotas/i, weight: 0.85 },
      { pattern: /nota\s*fiscal/i, weight: 0.5 },
      { pattern: /NF-?e|NFCe|CT-?e/i, weight: 0.6 },
    ],
    errorCategories: ['sefaz', 'certificate', 'database'],
    versionPattern: /vers[aã]o\s*([\d.]+)/i,
  },
  {
    id: 'sefaz_portal',
    name: 'Portal SEFAZ',
    windowPatterns: [/sefaz/i, /nfe\.fazenda/i, /nfce/i],
    ocrPatterns: [
      { pattern: /SEFAZ/i, weight: 0.85 },
      { pattern: /Secretaria\s+da?\s+Fazenda/i, weight: 0.7 },
      { pattern: /Consulta\s+NF-?e/i, weight: 0.6 },
    ],
    errorCategories: ['sefaz', 'certificate', 'network'],
  },
  {
    id: 'totvs_protheus',
    name: 'TOTVS Protheus',
    windowPatterns: [/protheus/i, /totvs/i, /smartclient/i],
    ocrPatterns: [
      { pattern: /protheus/i, weight: 0.85 },
      { pattern: /TOTVS/i, weight: 0.8 },
      { pattern: /smartclient/i, weight: 0.7 },
    ],
    errorCategories: ['database', 'network', 'generic'],
    versionPattern: /(?:Protheus|Release)\s*([\d.]+)/i,
  },
  {
    id: 'sap',
    name: 'SAP',
    windowPatterns: [/sap\s+logon/i, /sap\s+gui/i, /sap\s+business/i],
    ocrPatterns: [
      { pattern: /SAP\s/i, weight: 0.8 },
      { pattern: /transação|transaction/i, weight: 0.4 },
    ],
    errorCategories: ['database', 'network', 'generic'],
    versionPattern: /SAP\s+(?:GUI|NetWeaver)\s*([\d.]+)/i,
  },
  {
    id: 'glpi',
    name: 'GLPI',
    windowPatterns: [/glpi/i],
    ocrPatterns: [
      { pattern: /GLPI/i, weight: 0.85 },
      { pattern: /chamado|ticket|helpdesk/i, weight: 0.3 },
    ],
    errorCategories: ['network', 'database', 'generic'],
    versionPattern: /GLPI\s+versão?\s*([\d.]+)/i,
  },
  {
    id: 'teamviewer',
    name: 'TeamViewer',
    windowPatterns: [/teamviewer/i],
    ocrPatterns: [
      { pattern: /teamviewer/i, weight: 0.9 },
      { pattern: /controle\s+remoto/i, weight: 0.3 },
    ],
    errorCategories: ['network'],
    versionPattern: /TeamViewer\s*([\d.]+)/i,
  },
  {
    id: 'anydesk',
    name: 'AnyDesk',
    windowPatterns: [/anydesk/i],
    ocrPatterns: [
      { pattern: /anydesk/i, weight: 0.9 },
    ],
    errorCategories: ['network'],
    versionPattern: /AnyDesk\s*([\d.]+)/i,
  },
  {
    id: 'pgadmin',
    name: 'pgAdmin',
    windowPatterns: [/pgadmin/i],
    ocrPatterns: [
      { pattern: /pgadmin/i, weight: 0.9 },
      { pattern: /postgresql/i, weight: 0.5 },
    ],
    errorCategories: ['database'],
    versionPattern: /pgAdmin\s*([\d.]+)/i,
  },
  {
    id: 'dbeaver',
    name: 'DBeaver',
    windowPatterns: [/dbeaver/i],
    ocrPatterns: [
      { pattern: /dbeaver/i, weight: 0.9 },
    ],
    errorCategories: ['database'],
    versionPattern: /DBeaver\s*([\d.]+)/i,
  },
  {
    id: 'terminal',
    name: 'Terminal',
    windowPatterns: [
      /cmd\.exe/i,
      /powershell/i,
      /terminal/i,
      /prompt\s+de\s+comando/i,
      /bash/i,
      /zsh/i,
      /windows\s+terminal/i,
    ],
    ocrPatterns: [
      { pattern: /C:\\>/i, weight: 0.6 },
      { pattern: /PS\s+C:\\/i, weight: 0.7 },
      { pattern: /\$\s+[a-z]/i, weight: 0.3 },
    ],
    errorCategories: ['generic', 'network', 'database'],
  },
  {
    id: 'chrome',
    name: 'Google Chrome',
    windowPatterns: [/google\s+chrome/i, /chrome/i],
    ocrPatterns: [
      { pattern: /ERR_NAME_NOT_RESOLVED/i, weight: 0.9 },
      { pattern: /ERR_CONNECTION_REFUSED/i, weight: 0.9 },
      { pattern: /ERR_CERT/i, weight: 0.8 },
    ],
    errorCategories: ['network', 'certificate'],
  },
  {
    id: 'firefox',
    name: 'Mozilla Firefox',
    windowPatterns: [/mozilla\s+firefox/i, /firefox/i],
    ocrPatterns: [
      { pattern: /SEC_ERROR/i, weight: 0.8 },
      { pattern: /NS_ERROR/i, weight: 0.7 },
    ],
    errorCategories: ['network', 'certificate'],
  },
  {
    id: 'printer_dialog',
    name: 'Diálogo de Impressão',
    windowPatterns: [/imprimir|print/i, /impressora|printer/i, /spooler/i],
    ocrPatterns: [
      { pattern: /impressora|printer/i, weight: 0.6 },
      { pattern: /spooler/i, weight: 0.8 },
      { pattern: /fila\s+de\s+impress/i, weight: 0.7 },
    ],
    errorCategories: ['printing'],
  },
  {
    id: 'certmgr',
    name: 'Gerenciador de Certificados',
    windowPatterns: [/certmgr/i, /certificados?/i, /mmc/i],
    ocrPatterns: [
      { pattern: /certificado\s+digital/i, weight: 0.8 },
      { pattern: /A1|A3|e-?CNPJ|e-?CPF/i, weight: 0.6 },
      { pattern: /cadeia\s+de\s+certifica/i, weight: 0.7 },
    ],
    errorCategories: ['certificate'],
  },
];

// ═══════════════════════════════════════════════════════════════
// Software Detector
// ═══════════════════════════════════════════════════════════════

export class SoftwareDetector {
  private signatures: SoftwareSignature[];

  constructor(extraSignatures?: SoftwareSignature[]) {
    this.signatures = [...SOFTWARE_SIGNATURES, ...(extraSignatures ?? [])];
  }

  detectFromTitle(windowTitle: string): DetectedSoftware[] {
    if (!windowTitle) return [];

    const detected: DetectedSoftware[] = [];

    for (const sig of this.signatures) {
      for (const pattern of sig.windowPatterns) {
        if (pattern.test(windowTitle)) {
          const version = sig.versionPattern
            ? windowTitle.match(sig.versionPattern)?.[1]
            : undefined;

          detected.push({
            id: sig.id,
            name: sig.name,
            confidence: 0.95,
            detectedBy: 'window_title',
            version,
          });
          break; // Don't match same software multiple times
        }
      }
    }

    return detected;
  }

  detectFromOcr(ocrText: string): DetectedSoftware[] {
    if (!ocrText || ocrText.trim().length < 5) return [];

    const detected: DetectedSoftware[] = [];

    for (const sig of this.signatures) {
      let totalWeight = 0;
      let matchCount = 0;

      for (const ocrPattern of sig.ocrPatterns) {
        if (ocrPattern.pattern.test(ocrText)) {
          totalWeight += ocrPattern.weight;
          matchCount++;
        }
      }

      if (matchCount > 0) {
        const avgWeight = totalWeight / sig.ocrPatterns.length;
        const confidence = Math.min(0.85, avgWeight);

        if (confidence >= 0.3) {
          const version = sig.versionPattern
            ? ocrText.match(sig.versionPattern)?.[1]
            : undefined;

          detected.push({
            id: sig.id,
            name: sig.name,
            confidence,
            detectedBy: 'ocr_content',
            version,
          });
        }
      }
    }

    // Sort by confidence descending
    return detected.sort((a, b) => b.confidence - a.confidence);
  }

  getSignatureById(id: string): SoftwareSignature | undefined {
    return this.signatures.find((s) => s.id === id);
  }

  getCategories(softwareId: string): ErrorCategory[] {
    const sig = this.getSignatureById(softwareId);
    return sig?.errorCategories ?? [];
  }
}

export default SoftwareDetector;
