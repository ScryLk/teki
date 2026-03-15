import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const encoder = new TextEncoder();

  let cleanupFn: (() => void) | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: object) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      const poll = async () => {
        try {
          const now = new Date();
          const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
          const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

          const [activeUsers, messagesLastHour, conversationsLastHour] =
            await Promise.all([
              prisma.userSession.count({
                where: {
                  isActive: true,
                  lastActivityAt: { gte: fiveMinutesAgo },
                },
              }),
              prisma.message.count({
                where: { createdAt: { gte: oneHourAgo } },
              }),
              prisma.conversation.count({
                where: { createdAt: { gte: oneHourAgo } },
              }),
            ]);

          sendEvent({
            type: 'metrics',
            activeUsers,
            messagesLastHour,
            conversationsLastHour,
            timestamp: now.toISOString(),
          });
        } catch {
          // Silently continue on error
        }
      };

      // Initial send
      await poll();

      // Poll every 10 seconds
      const interval = setInterval(poll, 10_000);

      cleanupFn = () => {
        clearInterval(interval);
        try { controller.close(); } catch {}
      };

      // Max 5 minutes
      setTimeout(() => {
        cleanupFn?.();
      }, 5 * 60 * 1000);
    },
    cancel() {
      cleanupFn?.();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
