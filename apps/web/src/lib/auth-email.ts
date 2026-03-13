import { Resend } from 'resend';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://teki.com.br';

let resend: Resend | null = null;
function getResend() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export async function sendMagicLinkEmail({
  email,
  url,
}: {
  email: string;
  url: string;
}) {
  const client = getResend();
  if (!client) throw new Error('RESEND_API_KEY not configured');
  await client.emails.send({
    from: process.env.EMAIL_FROM || 'Teki <acesso@teki.com.br>',
    to: email,
    subject: 'Seu link de acesso ao Teki',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; background-color: #09090b;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; color: #fafafa; margin: 0;">
            Teki
          </h1>
          <p style="font-size: 14px; color: #71717a; margin: 8px 0 0;">
            Assistente IA para Suporte Tecnico
          </p>
        </div>

        <p style="font-size: 16px; color: #e4e4e7; line-height: 1.6;">
          Alguem (esperamos que voce!) pediu um link de acesso para o Teki.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${url}"
             style="display: inline-block; background-color: #2A8F9D; color: #ffffff;
                    font-size: 16px; font-weight: 600; padding: 14px 32px;
                    border-radius: 8px; text-decoration: none;">
            Entrar no Teki
          </a>
        </div>

        <p style="font-size: 13px; color: #71717a; line-height: 1.5;">
          Este link expira em 24 horas. Se voce nao pediu esse email, pode ignora-lo.
        </p>

        <hr style="border: none; border-top: 1px solid #27272a; margin: 32px 0;" />

        <p style="font-size: 12px; color: #52525b; text-align: center;">
          Teki — Assistente IA para Suporte Tecnico
        </p>
      </div>
    `,
  });
}

export async function sendVerificationEmail({
  email,
  token,
  firstName,
}: {
  email: string;
  token: string;
  firstName: string;
}) {
  const client = getResend();
  if (!client) {
    console.warn('[auth-email] RESEND_API_KEY not configured, skipping verification email');
    return;
  }

  const verifyUrl = `${APP_URL}/verificar?token=${token}`;

  await client.emails.send({
    from: process.env.EMAIL_FROM || 'Teki <acesso@teki.com.br>',
    to: email,
    subject: 'Verifique seu email — Teki',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; background-color: #09090b;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; color: #fafafa; margin: 0;">
            Teki
          </h1>
          <p style="font-size: 14px; color: #71717a; margin: 8px 0 0;">
            Assistente IA para Suporte Tecnico
          </p>
        </div>

        <p style="font-size: 16px; color: #e4e4e7; line-height: 1.6;">
          Ola, ${firstName}! Confirme seu email para ativar sua conta no Teki.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}"
             style="display: inline-block; background-color: #2A8F9D; color: #ffffff;
                    font-size: 16px; font-weight: 600; padding: 14px 32px;
                    border-radius: 8px; text-decoration: none;">
            Verificar email
          </a>
        </div>

        <p style="font-size: 13px; color: #71717a; line-height: 1.5;">
          Se voce nao criou uma conta no Teki, pode ignorar este email.
        </p>

        <hr style="border: none; border-top: 1px solid #27272a; margin: 32px 0;" />

        <p style="font-size: 12px; color: #52525b; text-align: center;">
          Teki — Assistente IA para Suporte Tecnico
        </p>
      </div>
    `,
  });
}
