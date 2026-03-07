import { CloudAdapter, ConfigurationBotFrameworkAuthentication, TurnContext } from 'botbuilder';
import { BaseChannel } from '../core/types';
import type { ChannelConfig, IncomingMessage } from '@teki/shared';
import { createServer, type Server } from 'http';

export class TeamsChannel extends BaseChannel {
  id = 'teams' as const;
  displayName = 'Microsoft Teams';
  authType = 'oauth' as const;

  private adapter: CloudAdapter | null = null;
  private server: Server | null = null;

  async connect(config: ChannelConfig): Promise<void> {
    if (!config.appId || !config.appPassword) {
      throw new Error('App ID e App Password são obrigatórios');
    }

    this.config = config;
    this.emitStatus('waiting', 'Conectando...');

    try {
      const auth = new ConfigurationBotFrameworkAuthentication({
        MicrosoftAppId: config.appId,
        MicrosoftAppPassword: config.appPassword,
        MicrosoftAppTenantId: config.tenantId || '',
      });

      this.adapter = new CloudAdapter(auth);

      this.adapter.onTurnError = async (context, error) => {
        console.error('[Teams] Turn error:', error);
        this.emitStatus('error', undefined, error.message);
      };

      // Start local HTTP server for messages
      const port = 3978;
      this.server = createServer(async (req, res) => {
        if (req.method === 'POST' && req.url === '/api/messages') {
          const chunks: Buffer[] = [];
          req.on('data', (chunk: Buffer) => chunks.push(chunk));
          req.on('end', async () => {
            const body = JSON.parse(Buffer.concat(chunks).toString());
            await this.adapter!.process(req, res, async (context: TurnContext) => {
              if (context.activity.type === 'message' && context.activity.text) {
                const incoming: IncomingMessage = {
                  channelId: 'teams',
                  senderId: context.activity.from.id,
                  senderName: context.activity.from.name ?? 'Usuário',
                  text: context.activity.text,
                  sessionKey: `teams:${context.activity.conversation.id}:${context.activity.from.id}`,
                  timestamp: new Date(context.activity.timestamp ?? Date.now()).getTime(),
                };
                this.onMessage?.(incoming);
              }
            });
          });
        } else {
          res.writeHead(404);
          res.end();
        }
      });

      this.server.listen(port, () => {
        this.emitStatus('connected', `Porta ${port}`);
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      this.emitStatus('error', undefined, message);
      throw err;
    }
  }

  async getOAuthUrl(): Promise<string | null> {
    if (!this.config?.appId || !this.config?.tenantId) return null;
    return `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/authorize?client_id=${this.config.appId}&response_type=code&scope=https://graph.microsoft.com/.default`;
  }

  async disconnect(): Promise<void> {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
    this.adapter = null;
    this.emitStatus('idle');
  }
}
