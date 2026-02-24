import type {
  AnonymizationOptions,
  AnonymizationResult,
  DataAccessAction,
  AccessorType,
  MemberRemovalPolicy,
} from '../types/user';

// ═══════════════════════════════════════════════════════════════
// Anonymization Service — LGPD Right to Erasure
//
// This module defines the interface and logic contract for
// anonymizing user data. The actual database operations are
// implemented in the web app layer (which has Prisma access).
// ═══════════════════════════════════════════════════════════════

/**
 * Fields that get anonymized vs deleted vs kept during user anonymization.
 */
export const ANONYMIZATION_PLAN = {
  /** Fields replaced with anonymized values */
  anonymized: {
    email: (userId: string) => `${userId}@anonymized.teki`,
    firstName: 'Usuario Removido',
    lastName: null,
    displayName: 'Usuario Removido',
  },
  /** Fields set to NULL */
  nullified: [
    'phone',
    'avatarUrl',
    'lastLoginIp',
    'lastLoginUserAgent',
  ] as const,
  /** Related records fully deleted */
  deleted: [
    'userCredentials',
    'userAuthProviders',
    'userPreferences',
  ] as const,
  /** Related records kept but PII stripped */
  stripped: [
    'userConsents',  // ip_address and user_agent set to NULL
    'userSessions',  // revoked, not deleted (audit trail)
  ] as const,
  /** Fields preserved for referential integrity */
  kept: [
    'id',
    'createdAt',
    'status',        // set to 'anonymized'
    'anonymizedAt',
    'anonymizedBy',
  ] as const,
} as const;

/**
 * Data categories tracked in data_access_log.
 * Used for LGPD Art. 37 compliance.
 */
export const DATA_CATEGORIES = [
  'email',
  'name',
  'phone',
  'avatar',
  'ip',
  'activity',
  'tickets',
  'ai_history',
  'preferences',
  'auth_tokens',
] as const;

export type DataCategory = (typeof DATA_CATEGORIES)[number];

/**
 * Describes the steps required to anonymize a user.
 * The consuming service should execute these in order within a transaction.
 */
export interface AnonymizationSteps {
  /** 1. Log the data access before any changes */
  logAccess: {
    accessorId: string;
    accessorType: AccessorType;
    subjectId: string;
    action: DataAccessAction;
    dataCategories: DataCategory[];
    justification: string;
  };
  /** 2. Anonymize the users table */
  anonymizeUser: {
    userId: string;
    email: string;
    firstName: string;
    lastName: null;
    status: 'anonymized';
    anonymizedAt: Date;
    anonymizedBy: string;
    nullifyFields: readonly string[];
  };
  /** 3. Revoke all active sessions */
  revokeSessions: {
    userId: string;
    revokedBy: string;
    revokeReason: 'account_anonymized';
  };
  /** 4. Delete authentication data */
  deleteAuth: {
    userId: string;
  };
  /** 5. Strip PII from consents */
  stripConsents: {
    userId: string;
    fieldsToNull: ['ipAddress', 'userAgent'];
  };
  /** 6. Delete avatar from storage */
  deleteAvatar: {
    avatarUrl: string | null;
  };
  /** 7. Delete preferences */
  deletePreferences: {
    userId: string;
  };
}

/**
 * Build the anonymization steps for a given user.
 * This is a pure function — no side effects, no DB calls.
 */
export function buildAnonymizationSteps(
  userId: string,
  requestedBy: string,
  avatarUrl: string | null
): AnonymizationSteps {
  const isSelfRequest = requestedBy === userId;
  const now = new Date();

  return {
    logAccess: {
      accessorId: requestedBy,
      accessorType: isSelfRequest ? 'user' : 'admin',
      subjectId: userId,
      action: 'anonymize',
      dataCategories: ['email', 'name', 'phone', 'avatar', 'ip'],
      justification: isSelfRequest
        ? 'Solicitacao do titular (LGPD Art. 18, VI)'
        : 'Remocao administrativa',
    },
    anonymizeUser: {
      userId,
      email: ANONYMIZATION_PLAN.anonymized.email(userId),
      firstName: ANONYMIZATION_PLAN.anonymized.firstName,
      lastName: null,
      status: 'anonymized',
      anonymizedAt: now,
      anonymizedBy: requestedBy,
      nullifyFields: ANONYMIZATION_PLAN.nullified,
    },
    revokeSessions: {
      userId,
      revokedBy: requestedBy,
      revokeReason: 'account_anonymized',
    },
    deleteAuth: {
      userId,
    },
    stripConsents: {
      userId,
      fieldsToNull: ['ipAddress', 'userAgent'],
    },
    deleteAvatar: {
      avatarUrl,
    },
    deletePreferences: {
      userId,
    },
  };
}

/**
 * Tenant data policy application.
 * Determines what operational data to keep/delete based on tenant policy.
 */
export interface TenantPolicyApplication {
  keepTickets: boolean;
  keepKbArticles: boolean;
  keepActivityLogs: boolean;
  deleteAiHistory: boolean;
  authorLabel: string;
}

export function resolveTenantPolicy(
  policy: {
    memberRemovalPolicy: MemberRemovalPolicy;
    keepTickets: boolean;
    keepKbArticles: boolean;
    keepActivityLogs: boolean;
    keepAiHistory: boolean;
  },
  options?: AnonymizationOptions
): TenantPolicyApplication {
  return {
    keepTickets: policy.keepTickets,
    keepKbArticles: policy.keepKbArticles,
    keepActivityLogs: policy.keepActivityLogs,
    deleteAiHistory: options?.deleteAiHistory ?? !policy.keepAiHistory,
    authorLabel: 'Usuario Removido',
  };
}

/**
 * Validate that a user can be anonymized.
 * Returns an array of reasons why anonymization cannot proceed, or empty if OK.
 */
export function validateAnonymization(
  userStatus: string,
  memberRoles: { tenantId: string; role: string }[]
): string[] {
  const errors: string[] = [];

  if (userStatus === 'anonymized') {
    errors.push('Usuario ja anonimizado');
  }

  const ownerTenants = memberRoles.filter((m) => m.role === 'owner');
  if (ownerTenants.length > 0) {
    errors.push(
      `Usuario e owner de ${ownerTenants.length} tenant(s). Transfira ownership antes de anonimizar.`
    );
  }

  return errors;
}
