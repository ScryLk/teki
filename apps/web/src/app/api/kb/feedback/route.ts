import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { requireTenant, TenantError } from '@/lib/tenant';
import { kbFeedbackSchema } from '@/lib/validations/kb';
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const tenant = await requireTenant(user);

    const body = await req.json();
    const data = kbFeedbackSchema.parse(body);

    // Update AI usage log feedback if ticketId is provided
    if (data.ticketId) {
      const latestLog = await prisma.aiUsageLog.findFirst({
        where: { ticketId: data.ticketId, tenantId: tenant.id },
        orderBy: { createdAt: 'desc' },
      });

      if (latestLog) {
        await prisma.aiUsageLog.update({
          where: { id: latestLog.id },
          data: { feedback: data.helpful ? 'helpful' : 'not_helpful' },
        });
      }
    }

    // Update KB article stats if articleId is provided
    if (data.articleId) {
      const article = await prisma.knowledgeBaseArticle.findFirst({
        where: { id: data.articleId, tenantId: tenant.id },
      });

      if (article) {
        const newUsageCount = article.usageCount + 1;
        const currentSuccessTotal = Number(article.successRate) * article.usageCount / 100;
        const newSuccessTotal = currentSuccessTotal + (data.helpful ? 1 : 0);
        const newSuccessRate = (newSuccessTotal / newUsageCount) * 100;

        await prisma.knowledgeBaseArticle.update({
          where: { id: data.articleId },
          data: {
            usageCount: newUsageCount,
            successRate: Math.round(newSuccessRate * 100) / 100,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof TenantError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
    }
    console.error('POST /api/kb/feedback error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
