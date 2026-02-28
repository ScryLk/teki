import { Resend } from 'resend';
import { randomUUID } from 'node:crypto';
import {
  EMAIL_TEMPLATES,
  templateRegistry,
  type EmailTemplate,
  type VerificationEmailData,
  type WelcomeEmailData,
  type PasswordResetData,
  type PasswordChangedData,
  type NewDeviceLoginData,
  type AccountLockedData,
  type GuardianInviteExistingData,
  type GuardianInviteNewData,
  type GuardianAcceptedData,
  type EmergencyScanAlertData,
  type SubscriptionActivatedData,
  type PaymentFailedData,
  type SubscriptionCancelledData,
  type SubscriptionRenewedData,
  type ExportRequestedData,
  type ExportReadyData,
  type DeletionScheduledData,
  type DeletionReminderData,
  type DeletionCompletedData,
} from './templates/index.js';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  template: EmailTemplate;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  replyTo?: string;
  tags?: { name: string; value: string }[];
  scheduledAt?: Date;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface EmailServiceConfig {
  resendApiKey?: string;
  emailFrom: string;
  emailReplyTo: string;
  emailDevRedirect?: string;
  isDevelopment: boolean;
  logger: {
    info: (obj: Record<string, unknown>, msg?: string) => void;
    warn: (obj: Record<string, unknown>, msg?: string) => void;
    error: (obj: Record<string, unknown>, msg?: string) => void;
  };
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export class EmailService {
  private resend: Resend | null;
  private config: EmailServiceConfig;

  constructor(config: EmailServiceConfig) {
    this.config = config;
    this.resend = config.resendApiKey ? new Resend(config.resendApiKey) : null;
  }

  // ═══════════════════════ AUTH ═══════════════════════

  sendVerificationEmail(to: string, data: VerificationEmailData): Promise<EmailResult> {
    return this.send({
      to,
      subject: 'Mudea — Confirme seu email',
      template: EMAIL_TEMPLATES.VERIFICATION_EMAIL,
      data,
      tags: [{ name: 'category', value: 'auth' }],
    });
  }

  sendWelcomeEmail(to: string, data: WelcomeEmailData): Promise<EmailResult> {
    return this.send({
      to,
      subject: 'Mudea — Bem-vindo ao Mudea!',
      template: EMAIL_TEMPLATES.WELCOME,
      data,
      tags: [{ name: 'category', value: 'auth' }],
    });
  }

  sendPasswordResetEmail(to: string, data: PasswordResetData): Promise<EmailResult> {
    return this.send({
      to,
      subject: 'Mudea — Redefinição de senha',
      template: EMAIL_TEMPLATES.PASSWORD_RESET,
      data,
      tags: [{ name: 'category', value: 'auth' }],
    });
  }

  sendPasswordChangedEmail(to: string, data: PasswordChangedData): Promise<EmailResult> {
    return this.send({
      to,
      subject: 'Mudea — Sua senha foi alterada',
      template: EMAIL_TEMPLATES.PASSWORD_CHANGED,
      data,
      tags: [{ name: 'category', value: 'auth' }],
    });
  }

  // ═══════════════════════ SEGURANÇA ═══════════════════════

  sendNewDeviceLoginEmail(to: string, data: NewDeviceLoginData): Promise<EmailResult> {
    return this.send({
      to,
      subject: 'Mudea — Novo login detectado',
      template: EMAIL_TEMPLATES.NEW_DEVICE_LOGIN,
      data,
      tags: [{ name: 'category', value: 'security' }],
    });
  }

  sendAccountLockedEmail(to: string, data: AccountLockedData): Promise<EmailResult> {
    return this.send({
      to,
      subject: 'Mudea — Conta bloqueada temporariamente',
      template: EMAIL_TEMPLATES.ACCOUNT_LOCKED,
      data,
      tags: [{ name: 'category', value: 'security' }],
    });
  }

  // ═══════════════════════ GUARDIÃO ═══════════════════════

  sendGuardianInviteExistingEmail(to: string, data: GuardianInviteExistingData): Promise<EmailResult> {
    return this.send({
      to,
      subject: `Mudea — ${data.protectedName} quer que você seja guardião(a)`,
      template: EMAIL_TEMPLATES.GUARDIAN_INVITE_EXISTING,
      data,
      tags: [{ name: 'category', value: 'guardian' }],
    });
  }

  sendGuardianInviteNewEmail(to: string, data: GuardianInviteNewData): Promise<EmailResult> {
    return this.send({
      to,
      subject: `Mudea — ${data.protectedName} precisa de você`,
      template: EMAIL_TEMPLATES.GUARDIAN_INVITE_NEW,
      data,
      tags: [{ name: 'category', value: 'guardian' }],
    });
  }

  sendGuardianAcceptedEmail(to: string, data: GuardianAcceptedData): Promise<EmailResult> {
    return this.send({
      to,
      subject: `Mudea — ${data.guardianName} aceitou ser seu guardião(a)`,
      template: EMAIL_TEMPLATES.GUARDIAN_ACCEPTED,
      data,
      tags: [{ name: 'category', value: 'guardian' }],
    });
  }

  // ═══════════════════════ EMERGÊNCIA ═══════════════════════

  sendEmergencyScanAlertEmail(to: string, data: EmergencyScanAlertData): Promise<EmailResult> {
    return this.send({
      to,
      subject: 'Mudea — Seu perfil de emergência foi acessado',
      template: EMAIL_TEMPLATES.EMERGENCY_SCAN_ALERT,
      data,
      tags: [{ name: 'category', value: 'emergency' }],
    });
  }

  // ═══════════════════════ ASSINATURA ═══════════════════════

  sendSubscriptionActivatedEmail(to: string, data: SubscriptionActivatedData): Promise<EmailResult> {
    return this.send({
      to,
      subject: 'Mudea — Plano ativado',
      template: EMAIL_TEMPLATES.SUBSCRIPTION_ACTIVATED,
      data,
      tags: [{ name: 'category', value: 'subscription' }],
    });
  }

  sendPaymentFailedEmail(to: string, data: PaymentFailedData): Promise<EmailResult> {
    return this.send({
      to,
      subject: 'Mudea — Falha no pagamento',
      template: EMAIL_TEMPLATES.PAYMENT_FAILED,
      data,
      tags: [{ name: 'category', value: 'subscription' }],
    });
  }

  sendSubscriptionCancelledEmail(to: string, data: SubscriptionCancelledData): Promise<EmailResult> {
    return this.send({
      to,
      subject: 'Mudea — Plano cancelado',
      template: EMAIL_TEMPLATES.SUBSCRIPTION_CANCELLED,
      data,
      tags: [{ name: 'category', value: 'subscription' }],
    });
  }

  sendSubscriptionRenewedEmail(to: string, data: SubscriptionRenewedData): Promise<EmailResult> {
    return this.send({
      to,
      subject: 'Mudea — Plano renovado',
      template: EMAIL_TEMPLATES.SUBSCRIPTION_RENEWED,
      data,
      tags: [{ name: 'category', value: 'subscription' }],
    });
  }

  // ═══════════════════════ LGPD ═══════════════════════

  sendExportRequestedEmail(to: string, data: ExportRequestedData): Promise<EmailResult> {
    return this.send({
      to,
      subject: 'Mudea — Exportação solicitada',
      template: EMAIL_TEMPLATES.EXPORT_REQUESTED,
      data,
      tags: [{ name: 'category', value: 'lgpd' }],
    });
  }

  sendExportReadyEmail(to: string, data: ExportReadyData): Promise<EmailResult> {
    return this.send({
      to,
      subject: 'Mudea — Seus dados estão prontos',
      template: EMAIL_TEMPLATES.EXPORT_READY,
      data,
      tags: [{ name: 'category', value: 'lgpd' }],
    });
  }

  sendDeletionScheduledEmail(to: string, data: DeletionScheduledData): Promise<EmailResult> {
    return this.send({
      to,
      subject: 'Mudea — Exclusão agendada',
      template: EMAIL_TEMPLATES.DELETION_SCHEDULED,
      data,
      tags: [{ name: 'category', value: 'lgpd' }],
    });
  }

  sendDeletionReminderEmail(to: string, data: DeletionReminderData): Promise<EmailResult> {
    return this.send({
      to,
      subject: `Mudea — Lembrete: exclusão em ${data.daysRemaining} dias`,
      template: EMAIL_TEMPLATES.DELETION_REMINDER,
      data,
      tags: [{ name: 'category', value: 'lgpd' }],
    });
  }

  sendDeletionCompletedEmail(to: string, data: DeletionCompletedData): Promise<EmailResult> {
    return this.send({
      to,
      subject: 'Mudea — Conta excluída',
      template: EMAIL_TEMPLATES.DELETION_COMPLETED,
      data,
      tags: [{ name: 'category', value: 'lgpd' }],
    });
  }

  // ═══════════════════════ PRIVATE ═══════════════════════

  private async send(options: SendEmailOptions): Promise<EmailResult> {
    const startTime = Date.now();
    const maskedTo = maskEmail(options.to);

    try {
      // 1. Render template
      const templateFn = templateRegistry[options.template];
      if (!templateFn) {
        this.config.logger.error(
          { template: options.template },
          'Email template not found'
        );
        return { success: false, error: `Template not found: ${options.template}` };
      }

      const { html, text } = templateFn(options.data);

      // 2. Dev mode without API key — mock send
      if (this.config.isDevelopment && !this.resend) {
        const mockId = `dev-mock-${randomUUID()}`;
        this.config.logger.info(
          {
            messageId: mockId,
            template: options.template,
            to: options.to,
            subject: options.subject,
            data: options.data,
            html: html.substring(0, 500) + '...',
            durationMs: Date.now() - startTime,
          },
          `[EMAIL MOCK] ${options.subject}`
        );
        return { success: true, messageId: mockId };
      }

      // 3. Dev mode with redirect — override recipient
      let to = options.to;
      let subject = options.subject;
      if (this.config.isDevelopment && this.config.emailDevRedirect) {
        const originalTo = Array.isArray(to) ? to.join(', ') : to;
        subject = `[DEV → ${originalTo}] ${subject}`;
        to = this.config.emailDevRedirect;
      }

      // 4. Send via Resend
      const { data, error } = await this.resend!.emails.send({
        from: this.config.emailFrom,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
        replyTo: options.replyTo || this.config.emailReplyTo,
        tags: options.tags,
        ...(options.scheduledAt ? { scheduledAt: options.scheduledAt.toISOString() } : {}),
      });

      const durationMs = Date.now() - startTime;

      if (error) {
        this.config.logger.error(
          { template: options.template, to: maskedTo, error: error.message, durationMs },
          `Email send failed: ${options.template}`
        );
        return { success: false, error: error.message };
      }

      this.config.logger.info(
        { messageId: data?.id, template: options.template, to: maskedTo, durationMs },
        `Email sent: ${options.template}`
      );

      return { success: true, messageId: data?.id };
    } catch (err) {
      const durationMs = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';

      this.config.logger.error(
        { template: options.template, to: maskedTo, error: errorMessage, durationMs },
        `Email send exception: ${options.template}`
      );

      return { success: false, error: errorMessage };
    }
  }
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function maskEmail(email: string | string[]): string {
  const mask = (e: string) => {
    const [user, domain] = e.split('@');
    if (!user || !domain) return '***';
    return `${user[0]}***@${domain}`;
  };
  return Array.isArray(email) ? email.map(mask).join(', ') : mask(email);
}
