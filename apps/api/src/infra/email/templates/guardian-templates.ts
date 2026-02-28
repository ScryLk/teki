import { emailLayout } from './layout.js';
import {
  emailButton,
  emailDisclaimer,
  emailHeading,
  emailInfoBox,
  emailParagraph,
  emailSecondaryButton,
} from './components.js';
import { htmlToPlainText } from '../utils/html-to-text.js';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export interface GuardianInviteExistingData {
  guardianName: string;
  protectedName: string;
  inviteMessage?: string;
  acceptUrl: string;
  declineUrl: string;
}

export interface GuardianInviteNewData {
  protectedName: string;
  inviteMessage?: string;
  registerUrl: string;
}

export interface GuardianAcceptedData {
  protectedName: string;
  guardianName: string;
  dashboardUrl: string;
}

// ────────────────────────────────────────────────────────────
// Templates
// ────────────────────────────────────────────────────────────

export function guardianInviteExistingTemplate(data: GuardianInviteExistingData): { html: string; text: string } {
  const messageBox = data.inviteMessage
    ? emailInfoBox(`<strong>Mensagem de ${data.protectedName}:</strong><br>${data.inviteMessage}`, 'info')
    : '';

  const content = [
    emailHeading(`${data.protectedName} quer que voc&ecirc; seja guardi&atilde;o(a)`),
    emailParagraph(
      `Ol&aacute; ${data.guardianName}, <strong>${data.protectedName}</strong> convidou voc&ecirc; para ser guardi&atilde;o(a) no Mudea.`
    ),
    emailParagraph(
      'Como guardi&atilde;o(a), voc&ecirc; receber&aacute; alertas de emerg&ecirc;ncia, poder&aacute; acompanhar a ades&atilde;o a medicamentos e ser&aacute; notificado(a) caso o perfil NFC de emerg&ecirc;ncia seja acessado.'
    ),
    messageBox,
    emailButton('Aceitar convite', data.acceptUrl),
    emailSecondaryButton('Recusar', data.declineUrl),
    emailDisclaimer(
      'Se voc&ecirc; n&atilde;o conhece esta pessoa ou n&atilde;o deseja ser guardi&atilde;o(a), pode recusar ou simplesmente ignorar este email.'
    ),
  ].join('');

  const html = emailLayout({
    title: 'Convite de guardião — Mudea',
    preheader: `${data.protectedName} quer que você seja guardião(a) no Mudea.`,
    content,
  });

  return { html, text: htmlToPlainText(html) };
}

export function guardianInviteNewTemplate(data: GuardianInviteNewData): { html: string; text: string } {
  const messageBox = data.inviteMessage
    ? emailInfoBox(`<strong>Mensagem de ${data.protectedName}:</strong><br>${data.inviteMessage}`, 'info')
    : '';

  const content = [
    emailHeading(`${data.protectedName} precisa de voc&ecirc;`),
    emailParagraph(
      `<strong>${data.protectedName}</strong> convidou voc&ecirc; para ser guardi&atilde;o(a) no <strong>Mudea</strong>, uma carteira digital de sa&uacute;de.`
    ),
    emailParagraph(
      'Como guardi&atilde;o(a), voc&ecirc; receber&aacute; alertas de emerg&ecirc;ncia, poder&aacute; acompanhar a ades&atilde;o a medicamentos e muito mais. &Eacute; gratuito e leva menos de 2 minutos para se cadastrar.'
    ),
    messageBox,
    emailButton('Criar conta e aceitar', data.registerUrl),
    emailDisclaimer(
      'Se voc&ecirc; n&atilde;o conhece esta pessoa, pode ignorar este email com seguran&ccedil;a.'
    ),
  ].join('');

  const html = emailLayout({
    title: 'Convite para o Mudea',
    preheader: `${data.protectedName} precisa de você como guardião(a) no Mudea.`,
    content,
  });

  return { html, text: htmlToPlainText(html) };
}

export function guardianAcceptedTemplate(data: GuardianAcceptedData): { html: string; text: string } {
  const content = [
    emailHeading('Boa not&iacute;cia!'),
    emailParagraph(
      `Ol&aacute; ${data.protectedName}, <strong>${data.guardianName}</strong> aceitou ser seu guardi&atilde;o(a) no Mudea.`
    ),
    emailParagraph(
      'Agora voc&ecirc; tem mais uma pessoa cuidando da sua sa&uacute;de. Seu guardi&atilde;o(a) receber&aacute; alertas de emerg&ecirc;ncia e poder&aacute; acompanhar sua ades&atilde;o a medicamentos.'
    ),
    emailButton('Ver dashboard', data.dashboardUrl),
  ].join('');

  const html = emailLayout({
    title: 'Guardião aceito — Mudea',
    preheader: `${data.guardianName} aceitou ser seu guardião(a).`,
    content,
  });

  return { html, text: htmlToPlainText(html) };
}
