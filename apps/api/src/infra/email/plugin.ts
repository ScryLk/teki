import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { EmailService } from './service.js';

declare module 'fastify' {
  interface FastifyInstance {
    email: EmailService;
  }
}

const emailPluginAsync: FastifyPluginAsync = async (app: FastifyInstance) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM || 'Mudea <noreply@mudea.app>';
  const emailReplyTo = process.env.EMAIL_REPLY_TO || 'suporte@mudea.app';
  const emailDevRedirect = process.env.EMAIL_DEV_REDIRECT || undefined;

  // In production, RESEND_API_KEY is required
  if (!isDevelopment && !resendApiKey) {
    throw new Error(
      'RESEND_API_KEY is required in production. Set it in your environment variables.'
    );
  }

  if (isDevelopment && !resendApiKey) {
    app.log.warn(
      'RESEND_API_KEY not set — emails will be logged to console (mock mode)'
    );
  }

  if (isDevelopment && emailDevRedirect) {
    app.log.info(
      { emailDevRedirect },
      'EMAIL_DEV_REDIRECT set — all emails will be redirected'
    );
  }

  const emailService = new EmailService({
    resendApiKey,
    emailFrom,
    emailReplyTo,
    emailDevRedirect,
    isDevelopment,
    logger: app.log,
  });

  app.decorate('email', emailService);

  app.log.info('Email plugin registered');
};

export const emailPlugin = fp(emailPluginAsync, {
  name: 'email',
  fastify: '5.x',
});
