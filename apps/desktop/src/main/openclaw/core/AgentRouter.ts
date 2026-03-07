import type { IncomingMessage } from '@teki/shared';
import settingsStore from '../../services/settings-store';

const OLLAMA_DEFAULT = 'http://localhost:11434';

export class AgentRouter {
  private sessions = new Map<string, Array<{ role: string; content: string }>>();

  async route(msg: IncomingMessage): Promise<string> {
    const apiKey = settingsStore.get('authApiKey');
    if (apiKey) {
      return this.routeViaAPI(msg, apiKey);
    }
    return this.routeViaOllama(msg);
  }

  private async routeViaAPI(msg: IncomingMessage, apiKey: string): Promise<string> {
    try {
      const res = await fetch('https://teki.com.br/api/openclaw/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          message: msg.text,
          sender: msg.senderId,
          senderName: msg.senderName,
          channel: msg.channelId,
          sessionKey: msg.sessionKey,
        }),
      });
      const data = await res.json();
      return data.response || data.reply || 'Desculpe, ocorreu um erro.';
    } catch {
      // Fallback to Ollama if API fails
      return this.routeViaOllama(msg);
    }
  }

  private async routeViaOllama(msg: IncomingMessage): Promise<string> {
    const history = this.sessions.get(msg.sessionKey) || [];
    history.push({ role: 'user', content: msg.text });

    const ollamaUrl = settingsStore.get('ollamaBaseUrl') || OLLAMA_DEFAULT;
    // selectedModel may be a cloud model ID (e.g. 'gemini-flash'), not valid for Ollama
    // Use a dedicated Ollama model for OpenClaw routing
    const model = 'gemma3:4b';

    try {
      const res = await fetch(`${ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content:
                'Você é o Teki, um assistente de suporte técnico com IA. ' +
                'Responda sempre em português do Brasil. Seja direto, técnico e prático. ' +
                `Canal: ${msg.channelId}. Usuário: ${msg.senderName}.`,
            },
            ...history,
          ],
          stream: false,
          options: { temperature: 0.5 },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`[AgentRouter] Ollama HTTP ${res.status}:`, errText);
        return 'Desculpe, o assistente está temporariamente indisponível.';
      }

      const data = await res.json();
      const response = data.message?.content || 'Sem resposta do modelo.';

      history.push({ role: 'assistant', content: response });
      if (history.length > 20) history.splice(0, history.length - 20);
      this.sessions.set(msg.sessionKey, history);

      return response;
    } catch (err) {
      console.error('[AgentRouter] Ollama error:', err);
      return 'Desculpe, o assistente está temporariamente indisponível.';
    }
  }
}
