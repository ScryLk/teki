import { NextRequest, NextResponse } from 'next/server';
import { getModelById } from '@teki/shared';
import { getProvider } from '@/lib/ai/router';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { withRequestLog } from '@/lib/request-logger';
import {
  checkMessageLimit,
  checkModelAccess,
  incrementUsage,
} from '@/lib/plan-limits';
import { logApiKeyUsage, estimateCost } from '@/lib/api-keys';
import { checkRateLimit, PLAN_RPM } from '@/lib/rate-limiter';
import { getUserProviderKeys } from '@/lib/provider-keys';
import { searchWithExpansion, formatExpansionContext, buildExpansionMetadata } from '@/lib/kb/query-expansion';
import { calculateConfidence, buildConfidenceMetadata } from '@/lib/kb/confidence-scorer';
import type { QueryExpansionResult } from '@/lib/kb/query-expansion';
import { prisma } from '@/lib/prisma';
import { dispatchWebhook } from '@/lib/webhooks/dispatch';
import type { ProviderMessage } from '@/lib/ai/types';

export const runtime = 'nodejs';

async function _POST(req: NextRequest) {
  try {
    const { user, authMethod, apiKeyId } = await requireAuth(req);

    const body = await req.json();
    const {
      messages,
      model: requestedModel,
      screenshot,
      screenshotMimeType,
      agentId,
      conversationId,
      stream = false,
    } = body;

    const modelId = requestedModel ?? 'gemini-flash';

    // 0. Rate limit check for API key auth
    if (authMethod === 'apikey' && apiKeyId) {
      const rpm = PLAN_RPM[user.planId] ?? 20;
      const { allowed, retryAfterMs } = checkRateLimit(apiKeyId, rpm, 60_000);
      if (!allowed) {
        return NextResponse.json(
          { error: { code: 'RATE_LIMIT_EXCEEDED', message: `Limite de ${rpm} requisições por minuto atingido.` } },
          {
            status: 429,
            headers: { 'Retry-After': String(Math.ceil((retryAfterMs ?? 60_000) / 1000)) },
          }
        );
      }
    }

    // 1. Validate model exists
    const modelInfo = getModelById(modelId);
    if (!modelInfo) {
      return NextResponse.json(
        { error: { code: 'MODEL_NOT_AVAILABLE', message: `Modelo "${modelId}" não encontrado.` } },
        { status: 400 }
      );
    }

    // 2. Check model access for plan
    const modelAccess = await checkModelAccess(user.planId, modelId);
    if (!modelAccess.allowed) {
      return NextResponse.json(
        { error: { code: 'MODEL_NOT_AVAILABLE', message: `Modelo "${modelId}" não disponível no seu plano.` } },
        { status: 403 }
      );
    }

    // 3. Check if user has BYOK keys
    const userKeys = await getUserProviderKeys(user.id);
    const isByok = !!userKeys[modelInfo.providerId];

    // 4. Check message rate limit
    const msgLimit = await checkMessageLimit(user.id, user.planId, isByok);
    if (!msgLimit.allowed) {
      return NextResponse.json(
        {
          error: {
            code: 'PLAN_LIMIT_REACHED',
            message: `Limite de ${msgLimit.limit} mensagens/mês atingido.`,
            current: msgLimit.current,
            limit: msgLimit.limit,
          },
        },
        { status: 429 }
      );
    }

    // 5. Load agent (if specified)
    let agent = null;
    if (agentId) {
      agent = await prisma.agent.findFirst({
        where: { id: agentId, userId: user.id },
      });
    }
    if (!agent) {
      agent = await prisma.agent.findFirst({
        where: { userId: user.id, isDefault: true },
      });
    }

    // 6. RAG: search knowledge base with progressive query expansion
    let kbContext = '';
    let expansionMeta = null;
    let expansionResultForConfidence: QueryExpansionResult | null = null;
    if (agent) {
      const docCount = await prisma.document.count({
        where: { agentId: agent.id, status: 'INDEXED' },
      });
      if (docCount > 0) {
        const lastUserMsg = [...(messages ?? [])]
          .reverse()
          .find((m: { role: string }) => m.role === 'user');
        if (lastUserMsg) {
          const expansionResult = await searchWithExpansion({
            agentId: agent.id,
            query: (lastUserMsg as { content: string }).content,
          });
          kbContext = formatExpansionContext(expansionResult);
          expansionMeta = buildExpansionMetadata(expansionResult);
          expansionResultForConfidence = expansionResult;
        }
      }
    }

    // 7. Build system prompt
    let systemPrompt = agent?.systemPrompt ??
      'Você é o Teki, um assistente de suporte técnico de TI. Responda em português brasileiro.';
    if (kbContext) {
      systemPrompt += '\n\n' + kbContext;
    }

    // 8. Build messages
    const providerMessages: ProviderMessage[] = (messages ?? []).map(
      (m: { role: string; content: string }) => ({
        role: m.role as ProviderMessage['role'],
        content: m.content,
      })
    );

    if (screenshot && providerMessages.length > 0) {
      const lastUser = [...providerMessages].reverse().find((m) => m.role === 'user');
      if (lastUser) {
        lastUser.image = {
          base64: screenshot,
          mimeType: (screenshotMimeType ?? 'image/png') as 'image/jpeg' | 'image/png',
        };
      }
    }

    // 9. Get or create conversation
    let convId = conversationId;
    if (!convId) {
      const firstMsg = providerMessages.find((m) => m.role === 'user');
      const title = firstMsg
        ? (firstMsg.content as string).slice(0, 80)
        : 'Nova conversa';

      // Find user's tenant
      const membership = await prisma.tenantMember.findFirst({
        where: { userId: user.id, status: 'ACTIVE' },
        select: { tenantId: true },
      });
      if (!membership) {
        return NextResponse.json(
          { error: { code: 'NO_TENANT', message: 'Nenhum tenant ativo.' } },
          { status: 400 }
        );
      }

      const conv = await prisma.conversation.create({
        data: {
          tenantId: membership.tenantId,
          type: 'AI_CHAT',
          title,
          createdBy: user.id,
          context: agent?.id ? { agentId: agent.id, source: 'WEB' } : { source: 'WEB' },
        },
      });

      // Add user as participant
      await prisma.conversationParticipant.create({
        data: {
          conversationId: conv.id,
          userId: user.id,
          role: 'CREATOR',
          status: 'ACTIVE',
        },
      });

      convId = conv.id;
    }

    // 10. Save user message
    const lastUserMsg = providerMessages[providerMessages.length - 1];
    if (lastUserMsg?.role === 'user') {
      const maxSeq = await prisma.message.aggregate({
        where: { conversationId: convId },
        _max: { sequenceNumber: true },
      });
      const nextSeq = (maxSeq._max.sequenceNumber ?? BigInt(0)) + BigInt(1);

      const userMembership = await prisma.tenantMember.findFirst({
        where: { userId: user.id, status: 'ACTIVE' },
        select: { tenantId: true },
      });

      await prisma.message.create({
        data: {
          conversationId: convId,
          tenantId: userMembership!.tenantId,
          senderType: 'USER_SENDER',
          senderId: user.id,
          contentType: 'TEXT',
          content: lastUserMsg.content as string,
          status: 'SENT',
          sequenceNumber: nextSeq,
        },
      });
    }

    // 11. Call AI provider
    const startTime = Date.now();
    const { provider, apiModelId } = getProvider(
      modelId,
      isByok ? userKeys : undefined
    );

    if (stream) {
      const streamResult = await provider.chatStream({
        model: apiModelId,
        messages: providerMessages,
        systemPrompt,
        stream: true,
      });

      return new Response(streamResult, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'X-Teki-Model': modelId,
          'X-Teki-Conversation-Id': convId,
        },
      });
    }

    const result = await provider.chat({
      model: apiModelId,
      messages: providerMessages,
      systemPrompt,
      stream: false,
    });

    const latencyMs = Date.now() - startTime;
    const tokensIn = result.usage?.inputTokens ?? 0;
    const tokensOut = result.usage?.outputTokens ?? 0;

    // 11b. Calculate confidence score (post-response)
    let confidenceMeta = null;
    if (expansionResultForConfidence) {
      const confidenceResult = calculateConfidence({
        expansionResult: expansionResultForConfidence,
        responseText: result.content,
        modelId,
      });
      confidenceMeta = buildConfidenceMetadata(confidenceResult);
    }

    // 12. Save assistant message (with expansion + confidence metadata)
    const messageMetadata: Record<string, unknown> = {};
    if (expansionMeta) messageMetadata.kb_expansion = expansionMeta;
    if (confidenceMeta) messageMetadata.confidence = confidenceMeta;

    {
      const maxSeq2 = await prisma.message.aggregate({
        where: { conversationId: convId },
        _max: { sequenceNumber: true },
      });
      const nextSeq2 = (maxSeq2._max.sequenceNumber ?? BigInt(0)) + BigInt(1);

      const aiMembership = await prisma.tenantMember.findFirst({
        where: { userId: user.id, status: 'ACTIVE' },
        select: { tenantId: true },
      });

      await prisma.message.create({
        data: {
          conversationId: convId,
          tenantId: aiMembership!.tenantId,
          senderType: 'AI_SENDER',
          contentType: 'TEXT',
          content: result.content,
          status: 'SENT',
          isAiGenerated: true,
          sequenceNumber: nextSeq2,
        },
      });
    }

    // 13. Increment usage
    await incrementUsage(user.id, tokensIn, tokensOut, isByok);

    // 13b. Log per-key usage (API key auth only)
    if (authMethod === 'apikey' && apiKeyId) {
      logApiKeyUsage({
        apiKeyId,
        userId: user.id,
        endpoint: '/api/v1/chat',
        method: 'POST',
        tokensIn,
        tokensOut,
        costUsd: estimateCost(modelId, tokensIn, tokensOut),
        latencyMs,
        modelId,
      });
    }

    // 14. Dispatch webhook (fire-and-forget)
    dispatchWebhook(user.id, 'message.created', {
      conversationId: convId,
      model: modelId,
      tokensIn,
      tokensOut,
    }).catch(() => {});

    return NextResponse.json(
      {
        content: result.content,
        model: modelId,
        conversationId: convId,
        usage: result.usage,
        ...(confidenceMeta ? {
          confidence: {
            percentage: confidenceMeta.percentage,
            label: confidenceMeta.label,
            classification: confidenceMeta.classification,
          },
        } : {}),
      },
      { headers: { 'X-Teki-Model': modelId } }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[chat route]', message);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}

export const POST = withRequestLog(_POST);
