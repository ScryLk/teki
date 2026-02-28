import type { VerificationEmailData, WelcomeEmailData, PasswordResetData, PasswordChangedData } from './auth-templates.js';
import type { NewDeviceLoginData, AccountLockedData } from './security-templates.js';
import type { GuardianInviteExistingData, GuardianInviteNewData, GuardianAcceptedData } from './guardian-templates.js';
import type { EmergencyScanAlertData } from './emergency-templates.js';
import type {
  SubscriptionActivatedData,
  PaymentFailedData,
  SubscriptionCancelledData,
  SubscriptionRenewedData,
} from './subscription-templates.js';
import type {
  ExportRequestedData,
  ExportReadyData,
  DeletionScheduledData,
  DeletionReminderData,
  DeletionCompletedData,
} from './lgpd-templates.js';

/**
 * Dados mock para preview de templates em desenvolvimento.
 * Cada key corresponde ao valor do EMAIL_TEMPLATES enum.
 */
export const MOCK_DATA: Record<string, unknown> = {
  // Auth
  verification_email: {
    userName: 'João Silva',
    verificationUrl: 'https://mudea.app/verify?token=mock-token-123',
    expiresInHours: 24,
  } satisfies VerificationEmailData,

  welcome: {
    userName: 'João Silva',
    loginUrl: 'https://mudea.app/login',
  } satisfies WelcomeEmailData,

  password_reset: {
    userName: 'João Silva',
    resetUrl: 'https://mudea.app/reset?token=mock-token-456',
    expiresInMinutes: 60,
    requestedIp: '189.44.xxx.xxx',
    requestedAt: '27/02/2026 às 14:32',
  } satisfies PasswordResetData,

  password_changed: {
    userName: 'João Silva',
    changedAt: '27/02/2026 às 15:10',
    changedIp: '189.44.xxx.xxx',
  } satisfies PasswordChangedData,

  // Security
  new_device_login: {
    userName: 'João Silva',
    deviceName: 'iPhone 15 Pro',
    deviceOs: 'iOS 18.2',
    loginIp: '189.44.xxx.xxx',
    loginCity: 'São Paulo, SP',
    loginAt: '27/02/2026 às 22:15',
    revokeSessionUrl: 'https://mudea.app/settings/sessions?revoke=mock-session-id',
  } satisfies NewDeviceLoginData,

  account_locked: {
    userName: 'João Silva',
    lockedUntil: '27/02/2026 às 15:30',
    attemptsCount: 5,
    unlockUrl: 'https://mudea.app/unlock?token=mock-unlock-token',
  } satisfies AccountLockedData,

  // Guardian
  guardian_invite_existing: {
    guardianName: 'Maria Santos',
    protectedName: 'João Silva',
    inviteMessage: 'Mãe, preciso que você acompanhe meus medicamentos. Obrigado!',
    acceptUrl: 'https://mudea.app/guardian/accept?token=mock-invite-token',
    declineUrl: 'https://mudea.app/guardian/decline?token=mock-invite-token',
  } satisfies GuardianInviteExistingData,

  guardian_invite_new: {
    protectedName: 'João Silva',
    inviteMessage: 'Mãe, criei uma conta no Mudea para gerenciar minha saúde. Preciso de você como guardiã!',
    registerUrl: 'https://mudea.app/register?invite=mock-invite-token',
  } satisfies GuardianInviteNewData,

  guardian_accepted: {
    protectedName: 'João Silva',
    guardianName: 'Maria Santos',
    dashboardUrl: 'https://mudea.app/dashboard/guardians',
  } satisfies GuardianAcceptedData,

  // Emergency
  emergency_scan_alert: {
    userName: 'João Silva',
    scannedAt: '27/02/2026 às 18:45',
    scannerCity: 'São Paulo',
    scannerCountry: 'Brasil',
    scanMethod: 'NFC Tag',
    profileUrl: 'https://mudea.app/emergency/logs/mock-scan-id',
  } satisfies EmergencyScanAlertData,

  // Subscription
  subscription_activated: {
    userName: 'João Silva',
    planName: 'Mudea Premium',
    price: 'R$ 19,90',
    billingCycle: 'Mensal',
    nextBillingDate: '27/03/2026',
    manageUrl: 'https://mudea.app/settings/subscription',
  } satisfies SubscriptionActivatedData,

  payment_failed: {
    userName: 'João Silva',
    planName: 'Mudea Premium',
    failureReason: 'Cartão recusado — fundos insuficientes',
    retryDate: '02/03/2026',
    updatePaymentUrl: 'https://mudea.app/settings/billing',
  } satisfies PaymentFailedData,

  subscription_cancelled: {
    userName: 'João Silva',
    planName: 'Mudea Premium',
    accessUntil: '27/03/2026',
    reactivateUrl: 'https://mudea.app/settings/subscription/reactivate',
  } satisfies SubscriptionCancelledData,

  subscription_renewed: {
    userName: 'João Silva',
    planName: 'Mudea Premium',
    amount: 'R$ 19,90',
    nextBillingDate: '27/04/2026',
    invoiceUrl: 'https://mudea.app/billing/invoices/mock-invoice-id',
  } satisfies SubscriptionRenewedData,

  // LGPD
  export_requested: {
    userName: 'João Silva',
    requestType: 'Exportação completa (todos os dados)',
    estimatedTime: 'Até 24 horas',
    exportId: 'EXP-2026-0227-001',
  } satisfies ExportRequestedData,

  export_ready: {
    userName: 'João Silva',
    downloadUrl: 'https://mudea.app/exports/download/mock-export-id',
    expiresAt: '06/03/2026 às 14:32',
    fileSize: '12.4 MB',
  } satisfies ExportReadyData,

  deletion_scheduled: {
    userName: 'João Silva',
    scheduledDate: '27/03/2026',
    cancelDeletionUrl: 'https://mudea.app/settings/account/cancel-deletion?token=mock-cancel-token',
  } satisfies DeletionScheduledData,

  deletion_reminder: {
    userName: 'João Silva',
    scheduledDate: '27/03/2026',
    daysRemaining: 7,
    cancelDeletionUrl: 'https://mudea.app/settings/account/cancel-deletion?token=mock-cancel-token',
  } satisfies DeletionReminderData,

  deletion_completed: {
    userName: 'João Silva',
    deletedAt: '27/03/2026 às 00:00',
  } satisfies DeletionCompletedData,
};
