import { emailLayout } from './layout.js';
import {
  emailButton,
  emailDataTable,
  emailDisclaimer,
  emailHeading,
  emailInfoBox,
} from './components.js';
import { htmlToPlainText } from '../utils/html-to-text.js';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export interface EmergencyScanAlertData {
  userName: string;
  scannedAt: string;
  scannerCity?: string;
  scannerCountry?: string;
  scanMethod: string;
  profileUrl: string;
}

// ────────────────────────────────────────────────────────────
// Templates
// ────────────────────────────────────────────────────────────

export function emergencyScanAlertTemplate(data: EmergencyScanAlertData): { html: string; text: string } {
  const location = [data.scannerCity, data.scannerCountry].filter(Boolean).join(', ') || 'Desconhecido';

  const content = [
    emailHeading('Perfil de emerg&ecirc;ncia acessado'),
    emailInfoBox(
      'Algu&eacute;m acessou seu perfil de sa&uacute;de de emerg&ecirc;ncia. Isso pode indicar uma situa&ccedil;&atilde;o de emerg&ecirc;ncia.',
      'warning'
    ),
    emailDataTable([
      { label: 'Quando', value: data.scannedAt },
      { label: 'Local', value: location },
      { label: 'M&eacute;todo', value: data.scanMethod },
    ]),
    emailButton('Ver detalhes', data.profileUrl),
    emailDisclaimer(
      'Se voc&ecirc; compartilhou seu QR Code/NFC intencionalmente, ignore este aviso.'
    ),
  ].join('');

  const html = emailLayout({
    title: 'Perfil de emergência acessado — Mudea',
    preheader: 'Alguém acessou seu perfil de saúde de emergência.',
    content,
  });

  return { html, text: htmlToPlainText(html) };
}
