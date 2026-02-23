import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

type WebhookEvent =
  | 'message.created'
  | 'conversation.created'
  | 'document.processed'
  | 'agent.updated'
  | 'plan.limit.reached'
  | 'channel.status_changed';

export async function dispatchWebhook(
  userId: string,
  event: WebhookEvent,
  payload: unknown
): Promise<void> {
  const endpoints = await prisma.webhookEndpoint.findMany({
    where: { userId, isActive: true, events: { has: event } },
  });

  for (const endpoint of endpoints) {
    const body = JSON.stringify({
      event,
      data: payload,
      timestamp: new Date().toISOString(),
    });
    const signature = crypto
      .createHmac('sha256', endpoint.secret)
      .update(body)
      .digest('hex');

    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Teki-Signature': `sha256=${signature}`,
          'X-Teki-Event': event,
        },
        body,
        signal: AbortSignal.timeout(10_000),
      });

      await prisma.webhookLog.create({
        data: {
          endpointId: endpoint.id,
          event,
          payload: payload as object,
          statusCode: response.status,
          deliveredAt: new Date(),
        },
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';
      await prisma.webhookLog.create({
        data: {
          endpointId: endpoint.id,
          event,
          payload: payload as object,
          statusCode: null,
          responseBody: message,
        },
      });
    }
  }
}
