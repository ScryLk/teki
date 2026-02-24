import { prisma } from '../prisma';
import type { ConsentPurpose, LegalBasis, ConsentCollectionMethod } from '@teki/shared';

// ═══════════════════════════════════════════════════════════════
// ConsentService — LGPD Art. 8 compliant consent management
// All records are IMMUTABLE — changes create new records
// ═══════════════════════════════════════════════════════════════

export interface RecordConsentInput {
  userId: string;
  purpose: ConsentPurpose;
  granted: boolean;
  legalBasis: LegalBasis;
  policyVersion: string;
  policyUrl?: string;
  collectionMethod: ConsentCollectionMethod;
  ipAddress?: string;
  userAgent?: string;
  geoCountry?: string;
  expiresAt?: Date;
}

/**
 * Record a new consent decision (always creates, never updates).
 */
export async function recordConsent(input: RecordConsentInput) {
  return prisma.userConsent.create({
    data: {
      userId: input.userId,
      purpose: mapPurpose(input.purpose),
      granted: input.granted,
      legalBasis: mapLegalBasis(input.legalBasis),
      policyVersion: input.policyVersion,
      policyUrl: input.policyUrl,
      collectionMethod: mapCollectionMethod(input.collectionMethod),
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      geoCountry: input.geoCountry,
      expiresAt: input.expiresAt,
    },
  });
}

/**
 * Record multiple required consents at once (e.g., during signup).
 */
export async function recordSignupConsents(
  userId: string,
  policyVersion: string,
  meta: { ipAddress?: string; userAgent?: string; geoCountry?: string }
) {
  const requiredConsents: RecordConsentInput[] = [
    {
      userId,
      purpose: 'terms_of_service',
      granted: true,
      legalBasis: 'contract',
      policyVersion,
      collectionMethod: 'signup_form',
      ...meta,
    },
    {
      userId,
      purpose: 'privacy_policy',
      granted: true,
      legalBasis: 'contract',
      policyVersion,
      collectionMethod: 'signup_form',
      ...meta,
    },
    {
      userId,
      purpose: 'data_processing',
      granted: true,
      legalBasis: 'contract',
      policyVersion,
      collectionMethod: 'signup_form',
      ...meta,
    },
  ];

  await prisma.$transaction(
    requiredConsents.map((c) =>
      prisma.userConsent.create({
        data: {
          userId: c.userId,
          purpose: mapPurpose(c.purpose),
          granted: c.granted,
          legalBasis: mapLegalBasis(c.legalBasis),
          policyVersion: c.policyVersion,
          collectionMethod: mapCollectionMethod(c.collectionMethod),
          ipAddress: c.ipAddress,
          userAgent: c.userAgent,
          geoCountry: c.geoCountry,
        },
      })
    )
  );
}

/**
 * Check if a user has currently granted consent for a specific purpose.
 * Returns the most recent consent record for that purpose.
 */
export async function checkConsent(
  userId: string,
  purpose: ConsentPurpose
): Promise<{ granted: boolean; recordedAt: Date } | null> {
  const latest = await prisma.userConsent.findFirst({
    where: {
      userId,
      purpose: mapPurpose(purpose),
    },
    orderBy: { createdAt: 'desc' },
    select: { granted: true, createdAt: true, expiresAt: true },
  });

  if (!latest) return null;

  // Check if expired
  if (latest.expiresAt && latest.expiresAt < new Date()) {
    return { granted: false, recordedAt: latest.createdAt };
  }

  return { granted: latest.granted, recordedAt: latest.createdAt };
}

/**
 * Get the current consent state for all purposes for a user.
 */
export async function getCurrentConsents(userId: string) {
  const consents = await prisma.userConsent.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      purpose: true,
      granted: true,
      legalBasis: true,
      policyVersion: true,
      createdAt: true,
      expiresAt: true,
    },
  });

  // Group by purpose, take the most recent
  const latest = new Map<string, (typeof consents)[0]>();
  for (const consent of consents) {
    if (!latest.has(consent.purpose)) {
      latest.set(consent.purpose, consent);
    }
  }

  return Array.from(latest.values());
}

/**
 * Get full consent history for a user (audit trail).
 */
export async function getConsentHistory(userId: string, purpose?: ConsentPurpose) {
  return prisma.userConsent.findMany({
    where: {
      userId,
      ...(purpose ? { purpose: mapPurpose(purpose) } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Map lowercase string types to Prisma enum values
function mapPurpose(p: ConsentPurpose): import('@prisma/client').ConsentPurpose {
  const map: Record<ConsentPurpose, import('@prisma/client').ConsentPurpose> = {
    terms_of_service: 'TERMS_OF_SERVICE',
    privacy_policy: 'PRIVACY_POLICY',
    data_processing: 'DATA_PROCESSING',
    ai_data_usage: 'AI_DATA_USAGE',
    marketing_email: 'MARKETING_EMAIL',
    analytics_tracking: 'ANALYTICS_TRACKING',
    third_party_sharing: 'THIRD_PARTY_SHARING',
    audio_recording: 'AUDIO_RECORDING',
    screen_capture: 'SCREEN_CAPTURE',
    cookie_analytics: 'COOKIE_ANALYTICS',
    cookie_marketing: 'COOKIE_MARKETING',
  };
  return map[p];
}

function mapLegalBasis(lb: LegalBasis): import('@prisma/client').LegalBasis {
  const map: Record<LegalBasis, import('@prisma/client').LegalBasis> = {
    consent: 'CONSENT',
    contract: 'CONTRACT',
    legal_obligation: 'LEGAL_OBLIGATION',
    legitimate_interest: 'LEGITIMATE_INTEREST',
  };
  return map[lb];
}

function mapCollectionMethod(cm: ConsentCollectionMethod): import('@prisma/client').ConsentCollectionMethod {
  const map: Record<ConsentCollectionMethod, import('@prisma/client').ConsentCollectionMethod> = {
    signup_form: 'SIGNUP_FORM',
    banner: 'BANNER',
    settings: 'SETTINGS',
    prompt: 'PROMPT',
    api: 'API',
    migration: 'MIGRATION',
  };
  return map[cm];
}
