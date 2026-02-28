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

export interface ExportRequestedData {
  userName: string;
  requestType: string;
  estimatedTime: string;
  exportId: string;
}

export interface ExportReadyData {
  userName: string;
  downloadUrl: string;
  expiresAt: string;
  fileSize: string;
}

export interface DeletionScheduledData {
  userName: string;
  scheduledDate: string;
  cancelDeletionUrl: string;
}

export interface DeletionReminderData {
  userName: string;
  scheduledDate: string;
  daysRemaining: number;
  cancelDeletionUrl: string;
}

export interface DeletionCompletedData {
  userName: string;
  deletedAt: string;
}

// ────────────────────────────────────────────────────────────
// Templates
// ────────────────────────────────────────────────────────────

export function exportRequestedTemplate(data: ExportRequestedData): { html: string; text: string } {
  const content = [
    emailHeading('Exporta&ccedil;&atilde;o solicitada'),
    emailParagraph(
      `Ol&aacute; ${data.userName}, recebemos sua solicita&ccedil;&atilde;o de exporta&ccedil;&atilde;o de dados.`
    ),
    emailDataTable([
      { label: 'Tipo', value: data.requestType },
      { label: 'Tempo estimado', value: data.estimatedTime },
      { label: 'ID da exporta&ccedil;&atilde;o', value: data.exportId },
    ]),
    emailInfoBox(
      'Voc&ecirc; receber&aacute; outro email quando seus dados estiverem prontos para download.',
      'info'
    ),
  ].join('');

  const html = emailLayout({
    title: 'Exportação solicitada — Mudea',
    preheader: 'Sua exportação de dados foi solicitada e está sendo processada.',
    content,
  });

  return { html, text: htmlToPlainText(html) };
}

export function exportReadyTemplate(data: ExportReadyData): { html: string; text: string } {
  const content = [
    emailHeading('Seus dados est&atilde;o prontos'),
    emailParagraph(
      `Ol&aacute; ${data.userName}, sua exporta&ccedil;&atilde;o de dados est&aacute; pronta para download.`
    ),
    emailDataTable([
      { label: 'Tamanho', value: data.fileSize },
      { label: 'Dispon&iacute;vel at&eacute;', value: data.expiresAt },
    ]),
    emailButton('Baixar dados', data.downloadUrl),
    emailDisclaimer(
      `O link de download expira em ${data.expiresAt}. Ap&oacute;s esse prazo, voc&ecirc; precisar&aacute; solicitar uma nova exporta&ccedil;&atilde;o.`
    ),
  ].join('');

  const html = emailLayout({
    title: 'Seus dados estão prontos — Mudea',
    preheader: 'Sua exportação de dados está pronta para download.',
    content,
  });

  return { html, text: htmlToPlainText(html) };
}

export function deletionScheduledTemplate(data: DeletionScheduledData): { html: string; text: string } {
  const content = [
    emailHeading('Exclus&atilde;o agendada'),
    emailParagraph(
      `Ol&aacute; ${data.userName}, sua conta est&aacute; agendada para exclus&atilde;o.`
    ),
    emailInfoBox(
      `Sua conta e todos os seus dados ser&atilde;o exclu&iacute;dos permanentemente em <strong>${data.scheduledDate}</strong>.`,
      'danger'
    ),
    emailParagraph(
      'Se voc&ecirc; mudou de ideia, pode cancelar a exclus&atilde;o a qualquer momento antes da data agendada.'
    ),
    emailButton('Cancelar exclus&atilde;o', data.cancelDeletionUrl),
    emailDisclaimer(
      'Ap&oacute;s a exclus&atilde;o, seus dados n&atilde;o poder&atilde;o ser recuperados. Este processo &eacute; irrevers&iacute;vel.'
    ),
  ].join('');

  const html = emailLayout({
    title: 'Exclusão agendada — Mudea',
    preheader: `Sua conta será excluída em ${data.scheduledDate}.`,
    content,
  });

  return { html, text: htmlToPlainText(html) };
}

export function deletionReminderTemplate(data: DeletionReminderData): { html: string; text: string } {
  const content = [
    emailHeading(`Lembrete: exclus&atilde;o em ${data.daysRemaining} dias`),
    emailInfoBox(
      `Sua conta ser&aacute; exclu&iacute;da permanentemente em <strong>${data.scheduledDate}</strong> (${data.daysRemaining} dias).`,
      'warning'
    ),
    emailParagraph(
      `Ol&aacute; ${data.userName}, este &eacute; um lembrete de que sua conta est&aacute; agendada para exclus&atilde;o. Todos os seus dados de sa&uacute;de, medicamentos, contatos de emerg&ecirc;ncia e hist&oacute;rico ser&atilde;o removidos permanentemente.`
    ),
    emailButton('Cancelar exclus&atilde;o', data.cancelDeletionUrl),
    emailDisclaimer(
      'Se voc&ecirc; deseja prosseguir com a exclus&atilde;o, nenhuma a&ccedil;&atilde;o &eacute; necess&aacute;ria.'
    ),
  ].join('');

  const html = emailLayout({
    title: `Lembrete: exclusão em ${data.daysRemaining} dias — Mudea`,
    preheader: `Sua conta será excluída em ${data.daysRemaining} dias.`,
    content,
  });

  return { html, text: htmlToPlainText(html) };
}

export function deletionCompletedTemplate(data: DeletionCompletedData): { html: string; text: string } {
  const content = [
    emailHeading('Conta exclu&iacute;da'),
    emailParagraph(
      `Ol&aacute; ${data.userName}, sua conta no Mudea foi exclu&iacute;da com sucesso.`
    ),
    emailDataTable([
      { label: 'Exclu&iacute;do em', value: data.deletedAt },
    ]),
    emailParagraph(
      'Todos os seus dados pessoais, dados de sa&uacute;de, medicamentos, contatos de emerg&ecirc;ncia e hist&oacute;rico foram removidos permanentemente dos nossos servidores.'
    ),
    emailParagraph(
      'Se quiser usar o Mudea novamente no futuro, basta criar uma nova conta.'
    ),
    emailDisclaimer(
      'Este email foi enviado como confirma&ccedil;&atilde;o final. Voc&ecirc; n&atilde;o receber&aacute; mais emails do Mudea.'
    ),
  ].join('');

  const html = emailLayout({
    title: 'Conta excluída — Mudea',
    preheader: 'Sua conta no Mudea foi excluída com sucesso.',
    content,
  });

  return { html, text: htmlToPlainText(html) };
}
