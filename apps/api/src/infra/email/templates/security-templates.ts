import { emailLayout } from './layout.js';
import {
  emailButton,
  emailDataTable,
  emailDisclaimer,
  emailHeading,
  emailInfoBox,
  emailParagraph,
} from './components.js';
import { htmlToPlainText } from '../utils/html-to-text.js';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export interface NewDeviceLoginData {
  userName: string;
  deviceName: string;
  deviceOs: string;
  loginIp: string;
  loginCity: string;
  loginAt: string;
  revokeSessionUrl: string;
}

export interface AccountLockedData {
  userName: string;
  lockedUntil: string;
  attemptsCount: number;
  unlockUrl: string;
}

// ────────────────────────────────────────────────────────────
// Templates
// ────────────────────────────────────────────────────────────

export function newDeviceLoginTemplate(data: NewDeviceLoginData): { html: string; text: string } {
  const content = [
    emailHeading('Login em novo dispositivo'),
    emailParagraph(
      `Ol&aacute; ${data.userName}, detectamos um login na sua conta a partir de um dispositivo novo.`
    ),
    emailDataTable([
      { label: 'Dispositivo', value: data.deviceName },
      { label: 'Sistema', value: data.deviceOs },
      { label: 'IP', value: data.loginIp },
      { label: 'Local', value: data.loginCity },
      { label: 'Quando', value: data.loginAt },
    ]),
    emailButton('N&atilde;o fui eu &mdash; Revogar sess&atilde;o', data.revokeSessionUrl, '#dc2626'),
    emailDisclaimer('Se foi voc&ecirc;, pode ignorar este email.'),
  ].join('');

  const html = emailLayout({
    title: 'Novo login detectado — Mudea',
    preheader: `Novo login detectado na sua conta a partir de ${data.deviceName}.`,
    content,
  });

  return { html, text: htmlToPlainText(html) };
}

export function accountLockedTemplate(data: AccountLockedData): { html: string; text: string } {
  const content = [
    emailHeading('Conta bloqueada'),
    emailInfoBox(
      `Sua conta foi bloqueada temporariamente ap&oacute;s ${data.attemptsCount} tentativas de login.`,
      'danger'
    ),
    emailParagraph(
      `O bloqueio ser&aacute; removido automaticamente em: <strong>${data.lockedUntil}</strong>`
    ),
    emailButton('Desbloquear conta', data.unlockUrl),
    emailDisclaimer(
      'Se n&atilde;o foi voc&ecirc; tentando acessar, recomendamos alterar sua senha.'
    ),
  ].join('');

  const html = emailLayout({
    title: 'Conta bloqueada — Mudea',
    preheader: 'Sua conta Mudea foi bloqueada temporariamente por tentativas de login.',
    content,
  });

  return { html, text: htmlToPlainText(html) };
}
