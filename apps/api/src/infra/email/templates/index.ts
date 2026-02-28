// ────────────────────────────────────────────────────────────
// Email Template Constants
// ────────────────────────────────────────────────────────────

export const EMAIL_TEMPLATES = {
  // Auth
  VERIFICATION_EMAIL: 'verification_email',
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password_reset',
  PASSWORD_CHANGED: 'password_changed',
  // Security
  NEW_DEVICE_LOGIN: 'new_device_login',
  ACCOUNT_LOCKED: 'account_locked',
  // Guardian
  GUARDIAN_INVITE_EXISTING: 'guardian_invite_existing',
  GUARDIAN_INVITE_NEW: 'guardian_invite_new',
  GUARDIAN_ACCEPTED: 'guardian_accepted',
  // Emergency
  EMERGENCY_SCAN_ALERT: 'emergency_scan_alert',
  // Subscription
  SUBSCRIPTION_ACTIVATED: 'subscription_activated',
  PAYMENT_FAILED: 'payment_failed',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  SUBSCRIPTION_RENEWED: 'subscription_renewed',
  // LGPD
  EXPORT_REQUESTED: 'export_requested',
  EXPORT_READY: 'export_ready',
  DELETION_SCHEDULED: 'deletion_scheduled',
  DELETION_REMINDER: 'deletion_reminder',
  DELETION_COMPLETED: 'deletion_completed',
} as const;

export type EmailTemplate = (typeof EMAIL_TEMPLATES)[keyof typeof EMAIL_TEMPLATES];

// ────────────────────────────────────────────────────────────
// Template Function Type
// ────────────────────────────────────────────────────────────

export type TemplateFunction<T = unknown> = (data: T) => { html: string; text: string };

// ────────────────────────────────────────────────────────────
// Template Re-exports
// ────────────────────────────────────────────────────────────

export {
  verificationEmailTemplate,
  welcomeEmailTemplate,
  passwordResetTemplate,
  passwordChangedTemplate,
} from './auth-templates.js';

export type {
  VerificationEmailData,
  WelcomeEmailData,
  PasswordResetData,
  PasswordChangedData,
} from './auth-templates.js';

export {
  newDeviceLoginTemplate,
  accountLockedTemplate,
} from './security-templates.js';

export type {
  NewDeviceLoginData,
  AccountLockedData,
} from './security-templates.js';

export {
  guardianInviteExistingTemplate,
  guardianInviteNewTemplate,
  guardianAcceptedTemplate,
} from './guardian-templates.js';

export type {
  GuardianInviteExistingData,
  GuardianInviteNewData,
  GuardianAcceptedData,
} from './guardian-templates.js';

export {
  emergencyScanAlertTemplate,
} from './emergency-templates.js';

export type {
  EmergencyScanAlertData,
} from './emergency-templates.js';

export {
  subscriptionActivatedTemplate,
  paymentFailedTemplate,
  subscriptionCancelledTemplate,
  subscriptionRenewedTemplate,
} from './subscription-templates.js';

export type {
  SubscriptionActivatedData,
  PaymentFailedData,
  SubscriptionCancelledData,
  SubscriptionRenewedData,
} from './subscription-templates.js';

export {
  exportRequestedTemplate,
  exportReadyTemplate,
  deletionScheduledTemplate,
  deletionReminderTemplate,
  deletionCompletedTemplate,
} from './lgpd-templates.js';

export type {
  ExportRequestedData,
  ExportReadyData,
  DeletionScheduledData,
  DeletionReminderData,
  DeletionCompletedData,
} from './lgpd-templates.js';

export { emailLayout } from './layout.js';
export {
  emailButton,
  emailSecondaryButton,
  emailDivider,
  emailInfoBox,
  emailDataTable,
  emailHeading,
  emailParagraph,
  emailDisclaimer,
  emailCode,
} from './components.js';

export { MOCK_DATA } from './mock-data.js';

// ────────────────────────────────────────────────────────────
// Template Registry
// ────────────────────────────────────────────────────────────

import { verificationEmailTemplate, welcomeEmailTemplate, passwordResetTemplate, passwordChangedTemplate } from './auth-templates.js';
import { newDeviceLoginTemplate, accountLockedTemplate } from './security-templates.js';
import { guardianInviteExistingTemplate, guardianInviteNewTemplate, guardianAcceptedTemplate } from './guardian-templates.js';
import { emergencyScanAlertTemplate } from './emergency-templates.js';
import { subscriptionActivatedTemplate, paymentFailedTemplate, subscriptionCancelledTemplate, subscriptionRenewedTemplate } from './subscription-templates.js';
import { exportRequestedTemplate, exportReadyTemplate, deletionScheduledTemplate, deletionReminderTemplate, deletionCompletedTemplate } from './lgpd-templates.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const templateRegistry: Record<EmailTemplate, TemplateFunction<any>> = {
  [EMAIL_TEMPLATES.VERIFICATION_EMAIL]: verificationEmailTemplate,
  [EMAIL_TEMPLATES.WELCOME]: welcomeEmailTemplate,
  [EMAIL_TEMPLATES.PASSWORD_RESET]: passwordResetTemplate,
  [EMAIL_TEMPLATES.PASSWORD_CHANGED]: passwordChangedTemplate,
  [EMAIL_TEMPLATES.NEW_DEVICE_LOGIN]: newDeviceLoginTemplate,
  [EMAIL_TEMPLATES.ACCOUNT_LOCKED]: accountLockedTemplate,
  [EMAIL_TEMPLATES.GUARDIAN_INVITE_EXISTING]: guardianInviteExistingTemplate,
  [EMAIL_TEMPLATES.GUARDIAN_INVITE_NEW]: guardianInviteNewTemplate,
  [EMAIL_TEMPLATES.GUARDIAN_ACCEPTED]: guardianAcceptedTemplate,
  [EMAIL_TEMPLATES.EMERGENCY_SCAN_ALERT]: emergencyScanAlertTemplate,
  [EMAIL_TEMPLATES.SUBSCRIPTION_ACTIVATED]: subscriptionActivatedTemplate,
  [EMAIL_TEMPLATES.PAYMENT_FAILED]: paymentFailedTemplate,
  [EMAIL_TEMPLATES.SUBSCRIPTION_CANCELLED]: subscriptionCancelledTemplate,
  [EMAIL_TEMPLATES.SUBSCRIPTION_RENEWED]: subscriptionRenewedTemplate,
  [EMAIL_TEMPLATES.EXPORT_REQUESTED]: exportRequestedTemplate,
  [EMAIL_TEMPLATES.EXPORT_READY]: exportReadyTemplate,
  [EMAIL_TEMPLATES.DELETION_SCHEDULED]: deletionScheduledTemplate,
  [EMAIL_TEMPLATES.DELETION_REMINDER]: deletionReminderTemplate,
  [EMAIL_TEMPLATES.DELETION_COMPLETED]: deletionCompletedTemplate,
};
