import { prisma } from '../prisma';
import type { Prisma } from '@prisma/client';
import type {
  ConversationType,
  ConversationStatus,
  SenderType,
  MessageContentType,
  ContentBlock,
  Mention,
  FeedbackRating,
  SourceType,
} from '@teki/shared';

// ═══════════════════════════════════════════════════════════════
// ConversationService — Core conversation management
// Handles: create, send messages, mark read, list, load messages
// ═══════════════════════════════════════════════════════════════

// ── Prisma Enum Mappers ──

function mapConversationType(t: ConversationType): import('@prisma/client').ConversationType {
  const map: Record<ConversationType, import('@prisma/client').ConversationType> = {
    ai_chat: 'AI_CHAT',
    floating: 'FLOATING',
    internal_note: 'INTERNAL_NOTE',
    support_chat: 'SUPPORT_CHAT',
    bot_flow: 'BOT_FLOW',
    voice_transcript: 'VOICE_TRANSCRIPT',
    group_chat: 'GROUP_CHAT',
  };
  return map[t];
}

function mapConversationStatus(s: ConversationStatus): import('@prisma/client').ConversationStatus {
  const map: Record<ConversationStatus, import('@prisma/client').ConversationStatus> = {
    active: 'ACTIVE',
    archived: 'ARCHIVED',
    closed: 'CLOSED',
    deleted: 'DELETED',
  };
  return map[s];
}

function mapSenderType(s: SenderType): import('@prisma/client').SenderType {
  const map: Record<SenderType, import('@prisma/client').SenderType> = {
    user: 'USER_SENDER',
    ai: 'AI_SENDER',
    system: 'SYSTEM_SENDER',
    bot: 'BOT_SENDER',
  };
  return map[s];
}

function mapContentType(c: MessageContentType): import('@prisma/client').MessageContentType {
  const map: Record<MessageContentType, import('@prisma/client').MessageContentType> = {
    text: 'TEXT',
    rich_text: 'RICH_TEXT',
    code: 'CODE',
    image: 'IMAGE',
    file: 'FILE',
    audio: 'AUDIO',
    system_event: 'SYSTEM_EVENT',
    suggestion: 'SUGGESTION',
    template: 'TEMPLATE',
    composite: 'COMPOSITE',
  };
  return map[c];
}

function mapSourceType(s: SourceType): import('@prisma/client').SourceType {
  const map: Record<SourceType, import('@prisma/client').SourceType> = {
    kb_article: 'KB_ARTICLE',
    kb_search: 'KB_SEARCH',
    web_search: 'WEB_SEARCH',
    web_page: 'WEB_PAGE',
    ticket_history: 'TICKET_HISTORY',
    conversation: 'CONVERSATION_REF',
    uploaded_file: 'UPLOADED_FILE',
    screen_capture: 'SCREEN_CAPTURE',
    audio_transcript: 'AUDIO_TRANSCRIPT',
    ai_knowledge: 'AI_KNOWLEDGE',
    template: 'TEMPLATE_SOURCE',
    api_response: 'API_RESPONSE',
    database_query: 'DATABASE_QUERY',
  };
  return map[s];
}

function mapFeedbackRating(r: FeedbackRating): import('@prisma/client').FeedbackRating {
  const map: Record<FeedbackRating, import('@prisma/client').FeedbackRating> = {
    positive: 'POSITIVE',
    negative: 'NEGATIVE',
    mixed: 'MIXED',
  };
  return map[r];
}

// ── Types ──

export interface CreateConversationInput {
  tenantId: string;
  userId: string;
  type: ConversationType;
  title?: string;
  context?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  participants?: Array<{ userId: string; role: 'participant' | 'observer' }>;
}

export interface SendMessageInput {
  conversationId: string;
  tenantId: string;
  senderId: string;
  senderType: SenderType;
  contentType: MessageContentType;
  content?: string;
  contentBlocks?: ContentBlock[];
  parentMessageId?: string;
  mentions?: Mention[];
}

export interface RecordAiMetadataInput {
  messageId: string;
  conversationId: string;
  tenantId: string;
  provider: string;
  model: string;
  tokensInput: number;
  tokensOutput: number;
  costInputUsd: number;
  costOutputUsd: number;
  latencyMs: number;
  timeToFirstTokenMs?: number;
  tokensPerSecond?: number;
  wasStreamed?: boolean;
  wasFallback?: boolean;
  originalProvider?: string;
  originalModel?: string;
  fallbackReason?: string;
  rawResponseId?: string;
  systemPromptHash?: string;
  systemPromptTokens?: number;
  conversationHistoryTokens?: number;
  contextWindowUsage?: number;
  streamChunks?: number;
  streamInterrupted?: boolean;
  cacheHit?: boolean;
  contentFiltered?: boolean;
  metadata?: Record<string, unknown>;
}

export interface RecordSourceInput {
  messageId: string;
  conversationId: string;
  tenantId: string;
  sourceType: SourceType;
  referenceId?: string;
  referenceUrl?: string;
  referenceTitle?: string;
  relevanceScore?: number;
  relevanceRank?: number;
  excerpt?: string;
  wasCited?: boolean;
  citationText?: string;
}

export interface SubmitFeedbackInput {
  messageId: string;
  conversationId: string;
  tenantId: string;
  userId: string;
  rating: FeedbackRating;
  comment?: string;
  tags?: string[];
  actionTaken?: string;
  correctedContent?: string;
}

// ── Create Conversation ──

export async function createConversation(input: CreateConversationInput) {
  const slug = input.title
    ? slugify(input.title) + '-' + randomString(6)
    : null;

  return prisma.$transaction(async (tx) => {
    const conv = await tx.conversation.create({
      data: {
        tenantId: input.tenantId,
        type: mapConversationType(input.type),
        title: input.title,
        slug,
        context: (input.context ?? {}) as Prisma.InputJsonValue,
        settings: (input.settings ?? {}) as Prisma.InputJsonValue,
        status: 'ACTIVE',
        createdBy: input.userId,
      },
    });

    // Add creator as participant
    await tx.conversationParticipant.create({
      data: {
        conversationId: conv.id,
        userId: input.userId,
        role: 'CREATOR',
        status: 'ACTIVE',
      },
    });

    let extraCount = 0;

    // Add extra participants
    if (input.participants?.length) {
      await tx.conversationParticipant.createMany({
        data: input.participants.map((p) => ({
          conversationId: conv.id,
          userId: p.userId,
          role: p.role === 'observer' ? ('OBSERVER' as const) : ('PARTICIPANT' as const),
          status: 'ACTIVE' as const,
        })),
      });
      extraCount = input.participants.length;
    }

    // Update participant count
    await tx.conversation.update({
      where: { id: conv.id },
      data: { participantCount: 1 + extraCount },
    });

    return conv;
  });
}

// ── Send Message ──

export async function sendMessage(input: SendMessageInput) {
  return prisma.$transaction(async (tx) => {
    // Verify permission (participant must be active and not observer)
    if (input.senderType === 'user') {
      const participant = await tx.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId: input.conversationId,
            userId: input.senderId,
          },
        },
      });
      if (!participant || participant.status !== 'ACTIVE' || participant.role === 'OBSERVER') {
        throw new Error('Sem permissao para enviar mensagem nesta conversa');
      }
    }

    // Threading: calculate depth
    let threadDepth = 0;
    if (input.parentMessageId) {
      const parent = await tx.message.findUnique({
        where: { id: input.parentMessageId },
      });
      if (parent) {
        threadDepth = parent.threadDepth + 1;
        if (threadDepth > 3) {
          throw new Error('Threading maximo de 3 niveis');
        }
        await tx.message.update({
          where: { id: input.parentMessageId },
          data: { threadMessageCount: { increment: 1 } },
        });
      }
    }

    // Get next sequence number
    const maxSeq = await tx.message.aggregate({
      where: { conversationId: input.conversationId },
      _max: { sequenceNumber: true },
    });
    const nextSeq = (maxSeq._max.sequenceNumber ?? BigInt(0)) + BigInt(1);

    // Create message
    const message = await tx.message.create({
      data: {
        conversationId: input.conversationId,
        tenantId: input.tenantId,
        senderType: mapSenderType(input.senderType),
        senderId: input.senderType === 'user' ? input.senderId : null,
        contentType: mapContentType(input.contentType),
        content: input.content,
        contentBlocks: input.contentBlocks as unknown as undefined,
        parentMessageId: input.parentMessageId,
        threadDepth,
        mentions: input.mentions as unknown as undefined,
        status: 'SENT',
        isAiGenerated: input.senderType === 'ai',
        sequenceNumber: nextSeq,
      },
    });

    // Update conversation counters + preview
    const preview = (input.content || '').substring(0, 200);
    const conv = await tx.conversation.findUnique({
      where: { id: input.conversationId },
      select: { firstMessageAt: true, messageCount: true, type: true, settings: true },
    });

    await tx.conversation.update({
      where: { id: input.conversationId },
      data: {
        messageCount: { increment: 1 },
        lastMessageAt: new Date(),
        lastMessagePreview: preview || null,
        firstMessageAt: conv?.firstMessageAt ?? new Date(),
      },
    });

    // Increment unread for other participants
    await incrementUnreadForOthers(
      tx,
      input.conversationId,
      input.senderType === 'user' ? input.senderId : null
    );

    return message;
  });
}

// ── Mark as Read ──

export async function markAsRead(conversationId: string, userId: string) {
  const lastMessage = await prisma.message.findFirst({
    where: { conversationId },
    orderBy: { sequenceNumber: 'desc' },
    select: { id: true },
  });

  await prisma.$transaction([
    prisma.conversationParticipant.update({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      data: {
        lastReadAt: new Date(),
        lastReadMessageId: lastMessage?.id,
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: {
        unreadCount: prisma.conversation.fields.unreadCount as unknown as Prisma.InputJsonValue, // Will be handled by setUnreadToZero
      },
    }),
  ]);

  // Set unread to 0 for this user using raw update
  await prisma.$executeRaw`
    UPDATE conversations
    SET unread_count = jsonb_set(
      unread_count,
      ARRAY[${userId}],
      '0'::jsonb
    )
    WHERE id = ${conversationId}::uuid
  `;
}

// ── List Conversations ──

export async function listConversations(input: {
  userId: string;
  tenantId: string;
  status?: ConversationStatus[];
  type?: ConversationType;
  limit?: number;
  offset?: number;
}) {
  const statusFilter = input.status?.map(mapConversationStatus) ?? ['ACTIVE', 'CLOSED'];

  return prisma.conversation.findMany({
    where: {
      tenantId: input.tenantId,
      status: { in: statusFilter },
      ...(input.type ? { type: mapConversationType(input.type) } : {}),
      participants: {
        some: {
          userId: input.userId,
          status: 'ACTIVE',
        },
      },
    },
    orderBy: { lastMessageAt: 'desc' },
    include: {
      _count: { select: { messages: true } },
      participants: {
        where: { userId: input.userId },
        select: { isPinned: true, isMuted: true },
      },
    },
    take: input.limit ?? 50,
    skip: input.offset ?? 0,
  });
}

// ── Load Messages (cursor-based pagination) ──

export async function loadMessages(input: {
  conversationId: string;
  userId: string;
  cursor?: bigint;
  limit?: number;
}) {
  const limit = input.limit ?? 50;

  const messages = await prisma.message.findMany({
    where: {
      conversationId: input.conversationId,
      status: { not: 'MSG_DELETED' },
      ...(input.cursor
        ? { sequenceNumber: { lt: input.cursor } }
        : {}),
    },
    orderBy: { sequenceNumber: 'desc' },
    take: limit,
    include: {
      sender: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      aiMetadata: {
        select: {
          provider: true,
          model: true,
          tokensInput: true,
          tokensOutput: true,
          costInputUsd: true,
          costOutputUsd: true,
          latencyMs: true,
          wasFallback: true,
        },
      },
      _count: {
        select: {
          sources: true,
        },
      },
      feedback: {
        where: { userId: input.userId },
        select: { rating: true },
      },
    },
  });

  return messages;
}

// ── Record AI Metadata ──

export async function recordAiMetadata(input: RecordAiMetadataInput) {
  return prisma.$transaction(async (tx) => {
    await tx.messageAiMetadata.create({
      data: {
        messageId: input.messageId,
        conversationId: input.conversationId,
        tenantId: input.tenantId,
        provider: input.provider,
        model: input.model,
        tokensInput: input.tokensInput,
        tokensOutput: input.tokensOutput,
        tokensCached: 0,
        costInputUsd: input.costInputUsd,
        costOutputUsd: input.costOutputUsd,
        latencyMs: input.latencyMs,
        timeToFirstTokenMs: input.timeToFirstTokenMs,
        tokensPerSecond: input.tokensPerSecond,
        wasStreamed: input.wasStreamed ?? false,
        streamChunks: input.streamChunks,
        streamInterrupted: input.streamInterrupted ?? false,
        wasFallback: input.wasFallback ?? false,
        originalProvider: input.originalProvider,
        originalModel: input.originalModel,
        fallbackReason: input.fallbackReason,
        cacheHit: input.cacheHit ?? false,
        contentFiltered: input.contentFiltered ?? false,
        rawResponseId: input.rawResponseId,
        systemPromptHash: input.systemPromptHash,
        systemPromptTokens: input.systemPromptTokens,
        conversationHistoryTokens: input.conversationHistoryTokens,
        contextWindowUsage: input.contextWindowUsage,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    // Update conversation totals
    await tx.conversation.update({
      where: { id: input.conversationId },
      data: {
        totalAiTokensIn: { increment: input.tokensInput },
        totalAiTokensOut: { increment: input.tokensOutput },
        totalAiCostUsd: { increment: input.costInputUsd + input.costOutputUsd },
        totalAiMessages: { increment: 1 },
      },
    });
  });
}

// ── Record Sources ──

export async function recordSources(sources: RecordSourceInput[]) {
  if (!sources.length) return;

  return prisma.messageSource.createMany({
    data: sources.map((s) => ({
      messageId: s.messageId,
      conversationId: s.conversationId,
      tenantId: s.tenantId,
      sourceType: mapSourceType(s.sourceType),
      referenceId: s.referenceId,
      referenceUrl: s.referenceUrl,
      referenceTitle: s.referenceTitle,
      relevanceScore: s.relevanceScore,
      relevanceRank: s.relevanceRank,
      excerpt: s.excerpt,
      wasCited: s.wasCited ?? false,
      citationText: s.citationText,
    })),
  });
}

// ── Submit Feedback ──

export async function submitFeedback(input: SubmitFeedbackInput) {
  const feedbackContext = await buildFeedbackContext(input.messageId);

  return prisma.messageFeedback.upsert({
    where: {
      messageId_userId: {
        messageId: input.messageId,
        userId: input.userId,
      },
    },
    create: {
      messageId: input.messageId,
      conversationId: input.conversationId,
      tenantId: input.tenantId,
      userId: input.userId,
      rating: mapFeedbackRating(input.rating),
      comment: input.comment,
      tags: input.tags,
      actionTaken: input.actionTaken,
      correctedContent: input.correctedContent,
      feedbackContext,
    },
    update: {
      rating: mapFeedbackRating(input.rating),
      comment: input.comment,
      tags: input.tags,
      actionTaken: input.actionTaken,
      correctedContent: input.correctedContent,
    },
  });
}

// ── Update Conversation Status ──

export async function updateConversationStatus(
  conversationId: string,
  status: ConversationStatus
) {
  return prisma.conversation.update({
    where: { id: conversationId },
    data: { status: mapConversationStatus(status) },
  });
}

// ── Archive Conversation ──

export async function archiveConversation(conversationId: string) {
  return updateConversationStatus(conversationId, 'archived');
}

// ── Update Conversation Title ──

export async function updateConversationTitle(
  conversationId: string,
  title: string
) {
  return prisma.conversation.update({
    where: { id: conversationId },
    data: {
      title,
      slug: slugify(title) + '-' + randomString(6),
    },
  });
}

// ── Update AI Summary ──

export async function updateAiSummary(
  conversationId: string,
  summary: string
) {
  return prisma.conversation.update({
    where: { id: conversationId },
    data: {
      aiSummary: summary,
      aiSummaryUpdatedAt: new Date(),
    },
  });
}

// ── Add Participant ──

export async function addParticipant(
  conversationId: string,
  userId: string,
  role: 'participant' | 'observer' = 'participant'
) {
  const created = await prisma.conversationParticipant.create({
    data: {
      conversationId,
      userId,
      role: role === 'observer' ? 'OBSERVER' : 'PARTICIPANT',
      status: 'ACTIVE',
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { participantCount: { increment: 1 } },
  });

  return created;
}

// ── Remove Participant ──

export async function removeParticipant(
  conversationId: string,
  userId: string
) {
  await prisma.conversationParticipant.update({
    where: {
      conversationId_userId: { conversationId, userId },
    },
    data: {
      status: 'REMOVED',
      leftAt: new Date(),
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { participantCount: { decrement: 1 } },
  });
}

// ── Pin/Unpin Message ──

export async function toggleMessagePin(messageId: string) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { isPinned: true },
  });
  if (!message) throw new Error('Mensagem nao encontrada');

  return prisma.message.update({
    where: { id: messageId },
    data: { isPinned: !message.isPinned },
  });
}

// ── Edit Message ──

export async function editMessage(
  messageId: string,
  userId: string,
  newContent: string
) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { senderId: true, content: true, originalContent: true },
  });
  if (!message) throw new Error('Mensagem nao encontrada');
  if (message.senderId !== userId) throw new Error('Sem permissao para editar');

  return prisma.message.update({
    where: { id: messageId },
    data: {
      content: newContent,
      originalContent: message.originalContent ?? message.content,
      status: 'EDITED',
      editedAt: new Date(),
      editedBy: userId,
    },
  });
}

// ── Soft Delete Message ──

export async function deleteMessage(messageId: string, userId: string) {
  return prisma.message.update({
    where: { id: messageId },
    data: {
      status: 'MSG_DELETED',
      deletedAt: new Date(),
      deletedBy: userId,
    },
  });
}

// ── Tag Management ──

export async function createTag(
  tenantId: string,
  createdBy: string,
  name: string,
  color?: string,
  description?: string
) {
  return prisma.conversationTag.create({
    data: {
      tenantId,
      createdBy,
      name,
      color: color ?? '#3f3f46',
      description,
    },
  });
}

export async function addTagToConversation(
  conversationId: string,
  tagId: string,
  addedBy: string
) {
  await prisma.conversationTagLink.create({
    data: { conversationId, tagId, addedBy },
  });

  await prisma.conversationTag.update({
    where: { id: tagId },
    data: { usageCount: { increment: 1 } },
  });
}

export async function removeTagFromConversation(
  conversationId: string,
  tagId: string
) {
  await prisma.conversationTagLink.delete({
    where: {
      conversationId_tagId: { conversationId, tagId },
    },
  });

  await prisma.conversationTag.update({
    where: { id: tagId },
    data: { usageCount: { decrement: 1 } },
  });
}

export async function listTags(tenantId: string) {
  return prisma.conversationTag.findMany({
    where: { tenantId },
    orderBy: { usageCount: 'desc' },
  });
}

// ── Helpers ──

async function incrementUnreadForOthers(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  conversationId: string,
  senderId: string | null
) {
  if (!senderId) return;

  // Use raw SQL to atomically increment unread for all other participants
  await tx.$executeRaw`
    UPDATE conversations
    SET unread_count = (
      SELECT jsonb_object_agg(
        cp.user_id::text,
        CASE
          WHEN cp.user_id = ${senderId}::uuid THEN 0
          ELSE COALESCE((unread_count->>cp.user_id::text)::int, 0) + 1
        END
      )
      FROM conversation_participants cp
      WHERE cp.conversation_id = ${conversationId}::uuid
        AND cp.status = 'ACTIVE'
    )
    WHERE id = ${conversationId}::uuid
  `;
}

async function buildFeedbackContext(messageId: string) {
  const aiMeta = await prisma.messageAiMetadata.findUnique({
    where: { messageId },
    select: {
      provider: true,
      model: true,
      wasStreamed: true,
      latencyMs: true,
    },
  });

  if (!aiMeta) return {};

  const sourcesCount = await prisma.messageSource.count({
    where: { messageId },
  });

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { sequenceNumber: true },
  });

  return {
    provider: aiMeta.provider,
    model: aiMeta.model,
    was_streaming: aiMeta.wasStreamed,
    response_time_ms: aiMeta.latencyMs,
    sources_count: sourcesCount,
    conversation_turn: Number(message?.sequenceNumber ?? 0),
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

function randomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
