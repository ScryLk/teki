import { prisma } from '../prisma';
import type { AttachmentCategory, AttachmentProcessingStatus } from '@teki/shared';

// ═══════════════════════════════════════════════════════════════
// ConversationAttachmentService — File management for messages
// Handles: upload record, processing status, expiration cleanup
// ═══════════════════════════════════════════════════════════════

function mapCategory(c: AttachmentCategory): import('@prisma/client').AttachmentCategory {
  const map: Record<AttachmentCategory, import('@prisma/client').AttachmentCategory> = {
    image: 'IMAGE_FILE',
    screenshot: 'SCREENSHOT',
    document: 'DOCUMENT',
    audio: 'AUDIO_FILE',
    video: 'VIDEO_FILE',
    log_file: 'LOG_FILE',
    code: 'CODE_FILE',
    file: 'GENERIC_FILE',
  };
  return map[c];
}

function mapProcessingStatus(s: AttachmentProcessingStatus): import('@prisma/client').AttachmentProcessingStatus {
  const map: Record<AttachmentProcessingStatus, import('@prisma/client').AttachmentProcessingStatus> = {
    uploaded: 'UPLOADED',
    processing: 'PROCESSING',
    completed: 'COMPLETED',
    failed: 'PROC_FAILED',
  };
  return map[s];
}

// ── Types ──

export interface CreateAttachmentInput {
  messageId: string;
  conversationId: string;
  tenantId: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  filePath: string;
  thumbnailPath?: string;
  category: AttachmentCategory;
  uploadedBy: string;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

// ── Create Attachment Record ──

export async function createAttachment(input: CreateAttachmentInput) {
  return prisma.messageAttachment.create({
    data: {
      messageId: input.messageId,
      conversationId: input.conversationId,
      tenantId: input.tenantId,
      fileName: input.fileName,
      fileType: input.fileType,
      fileSizeBytes: BigInt(input.fileSizeBytes),
      filePath: input.filePath,
      thumbnailPath: input.thumbnailPath,
      category: mapCategory(input.category),
      processingStatus: 'UPLOADED',
      uploadedBy: input.uploadedBy,
      expiresAt: input.expiresAt,
      metadata: input.metadata ?? {},
    },
  });
}

// ── Update Processing Status ──

export async function updateProcessingStatus(
  attachmentId: string,
  status: AttachmentProcessingStatus,
  result?: Record<string, unknown>
) {
  return prisma.messageAttachment.update({
    where: { id: attachmentId },
    data: {
      processingStatus: mapProcessingStatus(status),
      processingResult: result,
    },
  });
}

// ── Get Attachments for Message ──

export async function getAttachmentsForMessage(messageId: string) {
  return prisma.messageAttachment.findMany({
    where: { messageId },
    orderBy: { createdAt: 'asc' },
  });
}

// ── Get Attachments for Conversation ──

export async function getAttachmentsForConversation(
  conversationId: string,
  options?: { category?: AttachmentCategory; limit?: number; offset?: number }
) {
  return prisma.messageAttachment.findMany({
    where: {
      conversationId,
      ...(options?.category ? { category: mapCategory(options.category) } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: options?.limit ?? 50,
    skip: options?.offset ?? 0,
  });
}

// ── Cleanup Expired Attachments ──

export async function cleanupExpiredAttachments(): Promise<number> {
  const expired = await prisma.messageAttachment.findMany({
    where: {
      expiresAt: { lt: new Date() },
    },
    select: { id: true, filePath: true, thumbnailPath: true },
  });

  if (!expired.length) return 0;

  // Delete records (file cleanup from storage should be handled separately)
  await prisma.messageAttachment.deleteMany({
    where: {
      id: { in: expired.map((a) => a.id) },
    },
  });

  return expired.length;
}

// ── Get Storage Usage for Tenant ──

export async function getTenantStorageUsage(tenantId: string) {
  const result = await prisma.messageAttachment.aggregate({
    where: { tenantId },
    _sum: { fileSizeBytes: true },
    _count: true,
  });

  return {
    totalFiles: result._count,
    totalSizeBytes: Number(result._sum.fileSizeBytes ?? 0),
  };
}
