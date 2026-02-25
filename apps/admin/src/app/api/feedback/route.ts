import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = parseInt(params.get('page') || '0');
  const limit = Math.min(parseInt(params.get('limit') || '25'), 100);
  const rating = params.get('rating') || 'NEGATIVE';

  const where: Record<string, unknown> = {};
  if (rating) where.rating = rating;

  const [feedbacks, total] = await Promise.all([
    prisma.messageFeedback.findMany({
      take: limit,
      skip: page * limit,
      orderBy: { createdAt: 'desc' },
      where,
      include: {
        message: {
          select: {
            content: true,
            contentType: true,
            isAiGenerated: true,
            conversation: { select: { id: true, title: true, type: true } },
            aiMetadata: {
              select: { provider: true, model: true, latencyMs: true },
            },
          },
        },
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    }),
    prisma.messageFeedback.count({ where }),
  ]);

  return NextResponse.json({
    feedbacks: feedbacks.map((f) => ({
      id: f.id,
      rating: f.rating,
      comment: f.comment,
      tags: f.tags,
      actionTaken: f.actionTaken,
      correctedContent: f.correctedContent,
      createdAt: f.createdAt.toISOString(),
      user: {
        id: f.user.id,
        email: f.user.email,
        name: `${f.user.firstName} ${f.user.lastName || ''}`.trim(),
      },
      message: {
        content: f.message.content?.slice(0, 500),
        isAiGenerated: f.message.isAiGenerated,
        conversationTitle: f.message.conversation.title,
        conversationType: f.message.conversation.type,
        provider: f.message.aiMetadata?.provider ?? null,
        model: f.message.aiMetadata?.model ?? null,
        latencyMs: f.message.aiMetadata?.latencyMs ?? null,
      },
    })),
    total,
    page,
    pageSize: limit,
  });
}
