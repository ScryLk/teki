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

export interface VerificationEmailData {
  userName: string;
  verificationUrl: string;
  expiresInHours: number;
}

export interface WelcomeEmailData {
  userName: string;
  loginUrl: string;
}

export interface PasswordResetData {
  userName: string;
  resetUrl: string;
  expiresInMinutes: number;
  requestedIp: string;
  requestedAt: string;
}

export interface PasswordChangedData {
  userName: string;
  changedAt: string;
  changedIp: string;
}

// ────────────────────────────────────────────────────────────
// Templates
// ────────────────────────────────────────────────────────────

export function verificationEmailTemplate(data: VerificationEmailData): { html: string; text: string } {
  const content = [
    emailHeading('Confirme seu email'),
    emailParagraph(`Ol&aacute; ${data.userName}, clique no bot&atilde;o abaixo para verificar seu email e ativar sua conta no Mudea.`),
    emailButton('Verificar Email', data.verificationUrl),
    emailDisclaimer(
      `Este link expira em ${data.expiresInHours} horas. Se voc&ecirc; n&atilde;o criou uma conta no Mudea, ignore este email.`
    ),
  ].join('');

  const html = emailLayout({
    title: 'Confirme seu email — Mudea',
    preheader: `Confirme seu email para ativar sua conta no Mudea.`,
    content,
  });

  return { html, text: htmlToPlainText(html) };
}

export function welcomeEmailTemplate(data: WelcomeEmailData): { html: string; text: string } {
  const content = [
    emailHeading('Bem-vindo ao Mudea!'),
    emailParagraph(`Ol&aacute; ${data.userName}, sua conta foi verificada com sucesso.`),
    emailInfoBox(
      `<strong>Pr&oacute;ximos passos:</strong><br>
      1. Complete seu perfil de sa&uacute;de<br>
      2. Adicione contatos de emerg&ecirc;ncia<br>
      3. Configure seu NFC`,
      'success'
    ),
    emailButton('Acessar o Mudea', data.loginUrl),
  ].join('');

  const html = emailLayout({
    title: 'Bem-vindo ao Mudea!',
    preheader: 'Sua conta foi verificada. Comece a configurar seu perfil de saúde.',
    content,
  });

  return { html, text: htmlToPlainText(html) };
}

export function passwordResetTemplate(data: PasswordResetData): { html: string; text: string } {
  const content = [
    emailHeading('Redefini&ccedil;&atilde;o de senha'),
    emailParagraph(`Ol&aacute; ${data.userName}, recebemos uma solicita&ccedil;&atilde;o para redefinir sua senha.`),
    emailButton('Redefinir Senha', data.resetUrl),
    emailDataTable([
      { label: 'Solicitado em', value: data.requestedAt },
      { label: 'IP de origem', value: data.requestedIp },
    ]),
    emailInfoBox(
      'Se voc&ecirc; n&atilde;o fez esta solicita&ccedil;&atilde;o, algu&eacute;m pode estar tentando acessar sua conta.',
      'warning'
    ),
    emailDisclaimer(
      `Este link expira em ${data.expiresInMinutes} minutos. Se voc&ecirc; n&atilde;o solicitou, ignore este email &mdash; sua senha permanece segura.`
    ),
  ].join('');

  const html = emailLayout({
    title: 'Redefinição de senha — Mudea',
    preheader: 'Você solicitou a redefinição de senha da sua conta Mudea.',
    content,
  });

  return { html, text: htmlToPlainText(html) };
}

export function passwordChangedTemplate(data: PasswordChangedData): { html: string; text: string } {
  const content = [
    emailHeading('Senha alterada com sucesso'),
    emailParagraph(`Ol&aacute; ${data.userName}, sua senha foi alterada.`),
    emailDataTable([
      { label: 'Alterado em', value: data.changedAt },
      { label: 'IP de origem', value: data.changedIp },
    ]),
    emailInfoBox(
      'Se voc&ecirc; n&atilde;o fez esta altera&ccedil;&atilde;o, entre em contato imediatamente com nosso suporte.',
      'warning'
    ),
  ].join('');

  const html = emailLayout({
    title: 'Senha alterada — Mudea',
    preheader: 'Sua senha do Mudea foi alterada com sucesso.',
    content,
  });

  return { html, text: htmlToPlainText(html) };
}
