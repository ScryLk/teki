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

export interface SubscriptionActivatedData {
  userName: string;
  planName: string;
  price: string;
  billingCycle: string;
  nextBillingDate: string;
  manageUrl: string;
}

export interface PaymentFailedData {
  userName: string;
  planName: string;
  failureReason: string;
  retryDate: string;
  updatePaymentUrl: string;
}

export interface SubscriptionCancelledData {
  userName: string;
  planName: string;
  accessUntil: string;
  reactivateUrl: string;
}

export interface SubscriptionRenewedData {
  userName: string;
  planName: string;
  amount: string;
  nextBillingDate: string;
  invoiceUrl?: string;
}

// ────────────────────────────────────────────────────────────
// Templates
// ────────────────────────────────────────────────────────────

export function subscriptionActivatedTemplate(data: SubscriptionActivatedData): { html: string; text: string } {
  const content = [
    emailHeading('Plano ativado'),
    emailParagraph(
      `Ol&aacute; ${data.userName}, seu plano <strong>${data.planName}</strong> foi ativado com sucesso!`
    ),
    emailDataTable([
      { label: 'Plano', value: data.planName },
      { label: 'Valor', value: data.price },
      { label: 'Ciclo', value: data.billingCycle },
      { label: 'Pr&oacute;xima cobran&ccedil;a', value: data.nextBillingDate },
    ]),
    emailInfoBox('Agora voc&ecirc; tem acesso a todos os recursos do plano. Aproveite!', 'success'),
    emailButton('Gerenciar assinatura', data.manageUrl),
  ].join('');

  const html = emailLayout({
    title: 'Plano ativado — Mudea',
    preheader: `Seu plano ${data.planName} foi ativado com sucesso.`,
    content,
  });

  return { html, text: htmlToPlainText(html) };
}

export function paymentFailedTemplate(data: PaymentFailedData): { html: string; text: string } {
  const content = [
    emailHeading('Falha no pagamento'),
    emailParagraph(
      `Ol&aacute; ${data.userName}, n&atilde;o conseguimos processar o pagamento do seu plano <strong>${data.planName}</strong>.`
    ),
    emailInfoBox(`<strong>Motivo:</strong> ${data.failureReason}`, 'danger'),
    emailParagraph(
      `Tentaremos novamente em <strong>${data.retryDate}</strong>. Para evitar a interrup&ccedil;&atilde;o do servi&ccedil;o, atualize seus dados de pagamento.`
    ),
    emailButton('Atualizar pagamento', data.updatePaymentUrl),
    emailDisclaimer(
      'Se voc&ecirc; j&aacute; resolveu a quest&atilde;o do pagamento, pode ignorar este email.'
    ),
  ].join('');

  const html = emailLayout({
    title: 'Falha no pagamento — Mudea',
    preheader: 'Não conseguimos processar o pagamento do seu plano.',
    content,
  });

  return { html, text: htmlToPlainText(html) };
}

export function subscriptionCancelledTemplate(data: SubscriptionCancelledData): { html: string; text: string } {
  const content = [
    emailHeading('Plano cancelado'),
    emailParagraph(
      `Ol&aacute; ${data.userName}, seu plano <strong>${data.planName}</strong> foi cancelado.`
    ),
    emailInfoBox(
      `Voc&ecirc; ainda ter&aacute; acesso aos recursos premium at&eacute; <strong>${data.accessUntil}</strong>.`,
      'info'
    ),
    emailParagraph(
      'Sentiremos sua falta! Se mudar de ideia, voc&ecirc; pode reativar seu plano a qualquer momento.'
    ),
    emailButton('Reativar plano', data.reactivateUrl),
  ].join('');

  const html = emailLayout({
    title: 'Plano cancelado — Mudea',
    preheader: `Seu plano ${data.planName} foi cancelado.`,
    content,
  });

  return { html, text: htmlToPlainText(html) };
}

export function subscriptionRenewedTemplate(data: SubscriptionRenewedData): { html: string; text: string } {
  const rows = [
    { label: 'Plano', value: data.planName },
    { label: 'Valor', value: data.amount },
    { label: 'Pr&oacute;xima cobran&ccedil;a', value: data.nextBillingDate },
  ];

  const invoiceButton = data.invoiceUrl
    ? emailButton('Ver fatura', data.invoiceUrl)
    : '';

  const content = [
    emailHeading('Plano renovado'),
    emailParagraph(
      `Ol&aacute; ${data.userName}, seu plano <strong>${data.planName}</strong> foi renovado automaticamente.`
    ),
    emailDataTable(rows),
    invoiceButton,
    emailDisclaimer(
      'Este &eacute; um email autom&aacute;tico de confirma&ccedil;&atilde;o de renova&ccedil;&atilde;o.'
    ),
  ].join('');

  const html = emailLayout({
    title: 'Plano renovado — Mudea',
    preheader: `Seu plano ${data.planName} foi renovado automaticamente.`,
    content,
  });

  return { html, text: htmlToPlainText(html) };
}
