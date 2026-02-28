import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import {
  EMAIL_TEMPLATES,
  templateRegistry,
  MOCK_DATA,
  type EmailTemplate,
} from '../../infra/email/templates/index.js';

/**
 * Rotas de desenvolvimento para preview de email templates.
 * Disponível APENAS quando NODE_ENV !== 'production'.
 */
export const devRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // Guard: never register in production
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  /**
   * GET /v1/dev/email-preview
   * Lista todos os templates disponíveis para preview.
   */
  app.get('/v1/dev/email-preview', async (_request, reply) => {
    const templates = Object.entries(EMAIL_TEMPLATES).map(([key, value]) => ({
      key,
      template: value,
      previewUrl: `/v1/dev/email-preview/${value}`,
      hasMockData: value in MOCK_DATA,
    }));

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Email Templates — Mudea Dev</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f4f7; padding: 32px; }
    h1 { font-size: 24px; margin-bottom: 8px; color: #111827; }
    .subtitle { color: #6b7280; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .card h2 { font-size: 14px; color: #374151; margin-bottom: 4px; }
    .card .template-id { font-size: 12px; color: #9ca3af; font-family: monospace; margin-bottom: 12px; }
    .card a { display: inline-block; padding: 8px 16px; background: #3399FF; color: white; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 500; }
    .card a:hover { background: #2277DD; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; margin-left: 8px; }
    .badge-ok { background: #dcfce7; color: #166534; }
    .badge-missing { background: #fef2f2; color: #991b1b; }
  </style>
</head>
<body>
  <h1>Email Templates Preview</h1>
  <p class="subtitle">${templates.length} templates disponíveis</p>
  <div class="grid">
    ${templates
      .map(
        (t) => `
      <div class="card">
        <h2>${t.key}<span class="badge ${t.hasMockData ? 'badge-ok' : 'badge-missing'}">${t.hasMockData ? 'mock data' : 'sem mock'}</span></h2>
        <p class="template-id">${t.template}</p>
        <a href="${t.previewUrl}" target="_blank">Preview</a>
      </div>`
      )
      .join('')}
  </div>
</body>
</html>`;

    return reply.type('text/html').send(html);
  });

  /**
   * GET /v1/dev/email-preview/:template
   * Renderiza um template específico com dados mock.
   * Aceita query params para sobrescrever dados mock.
   */
  app.get<{
    Params: { template: string };
    Querystring: Record<string, string>;
  }>('/v1/dev/email-preview/:template', async (request, reply) => {
    const { template } = request.params;

    // Validate template exists
    const templateValues = Object.values(EMAIL_TEMPLATES) as string[];
    if (!templateValues.includes(template)) {
      return reply.status(404).send({
        error: `Template "${template}" not found. Available: ${templateValues.join(', ')}`,
      });
    }

    const templateFn = templateRegistry[template as EmailTemplate];
    if (!templateFn) {
      return reply.status(500).send({
        error: `Template function not registered for "${template}"`,
      });
    }

    // Merge mock data with query params overrides
    const mockData = (MOCK_DATA[template] as Record<string, unknown>) || {};
    const overrides = request.query || {};
    const data = { ...mockData, ...overrides };

    const { html } = templateFn(data);

    return reply.type('text/html').send(html);
  });
};
