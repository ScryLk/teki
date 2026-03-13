import type { IncomingMessage } from '@teki/shared';
import { getModelById } from '@teki/shared';
import settingsStore from '../../services/settings-store';
import { getKBService } from '../../services/kb-service';

const OLLAMA_DEFAULT = 'http://localhost:11434';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

const SYSTEM_PROMPT = (msg: IncomingMessage) =>
  'Você é o Teki, um assistente de suporte técnico com IA. ' +
  'Responda sempre em português do Brasil. Seja direto, técnico e prático. ' +
  `Canal: ${msg.channelId}. Usuário: ${msg.senderName}.`;

export class AgentRouter {
  private sessions = new Map<string, Array<{ role: string; content: string }>>();

  private async getKBContext(query: string): Promise<string> {
    try {
      const kbEnabled = settingsStore.get('kbEnabled');
      if (!kbEnabled) return '';
      const kb = getKBService();
      return await kb.buildContext(query);
    } catch {
      return '';
    }
  }

  async route(msg: IncomingMessage): Promise<string> {
    // If authenticated with Teki API, use that first
    const authKey = settingsStore.get('authApiKey');
    if (authKey) {
      try {
        return await this.routeViaAPI(msg, authKey);
      } catch {
        // Fall through to local routing
      }
    }

    // Fetch KB context once
    const kbContext = await this.getKBContext(msg.text);

    // Use the model selected in settings
    const selectedModel = settingsStore.get('selectedModel') || 'gemini-flash';
    const model = getModelById(selectedModel);
    const providerId = model?.providerId ?? 'gemini';
    console.log(`[AgentRouter] Using model: ${selectedModel} (${model?.apiModelId}) via ${providerId}`);

    try {
      switch (providerId) {
        case 'gemini':
          return await this.routeViaGemini(msg, model?.apiModelId, kbContext);
        case 'openai':
          return await this.routeViaOpenAI(msg, model?.apiModelId, kbContext);
        case 'anthropic':
          return await this.routeViaAnthropic(msg, model?.apiModelId, kbContext);
        case 'ollama':
          return await this.routeViaOllama(msg, model?.apiModelId, kbContext);
        default:
          return await this.routeViaGemini(msg, undefined, kbContext);
      }
    } catch (err) {
      console.error(`[AgentRouter] ${providerId} failed:`, err);
      return 'Desculpe, o assistente está temporariamente indisponível.';
    }
  }

  private getHistory(sessionKey: string): Array<{ role: string; content: string }> {
    return this.sessions.get(sessionKey) || [];
  }

  private pushHistory(sessionKey: string, history: Array<{ role: string; content: string }>, role: string, content: string) {
    history.push({ role, content });
    if (history.length > 20) history.splice(0, history.length - 20);
    this.sessions.set(sessionKey, history);
  }

  // ── Teki Cloud API ──────────────────────────────────────────────────────────

  private async routeViaAPI(msg: IncomingMessage, apiKey: string): Promise<string> {
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
  }

  // ── Gemini ──────────────────────────────────────────────────────────────────

  private async routeViaGemini(msg: IncomingMessage, apiModelId?: string, kbContext?: string): Promise<string> {
    const geminiKey = settingsStore.get('geminiApiKey');
    if (!geminiKey) throw new Error('Gemini API key not configured');

    const history = this.getHistory(msg.sessionKey);
    history.push({ role: 'user', content: msg.text });

    const sysPrompt = kbContext ? `${SYSTEM_PROMPT(msg)}\n\n${kbContext}` : SYSTEM_PROMPT(msg);
    const contents = [
      { role: 'user', parts: [{ text: sysPrompt }] },
      { role: 'model', parts: [{ text: 'Entendido. Estou pronto para ajudar.' }] },
      ...history.map((h) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      })),
    ];

    const model = apiModelId || 'gemini-2.5-flash';
    const res = await fetch(`${GEMINI_API_URL}/${model}:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[AgentRouter] Gemini HTTP ${res.status}:`, errText);
      throw new Error(`Gemini HTTP ${res.status}`);
    }

    const data = await res.json();
    const response = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta do modelo.';
    this.pushHistory(msg.sessionKey, history, 'assistant', response);
    return response;
  }

  // ── OpenAI ──────────────────────────────────────────────────────────────────

  private async routeViaOpenAI(msg: IncomingMessage, apiModelId?: string, kbContext?: string): Promise<string> {
    const openaiKey = settingsStore.get('openaiApiKey');
    if (!openaiKey) throw new Error('OpenAI API key not configured');

    const history = this.getHistory(msg.sessionKey);
    history.push({ role: 'user', content: msg.text });

    const model = apiModelId || 'gpt-4o-mini';
    const res = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: kbContext ? `${SYSTEM_PROMPT(msg)}\n\n${kbContext}` : SYSTEM_PROMPT(msg) },
          ...history,
        ],
        temperature: 0.5,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[AgentRouter] OpenAI HTTP ${res.status}:`, errText);
      throw new Error(`OpenAI HTTP ${res.status}`);
    }

    const data = await res.json();
    const response = data.choices?.[0]?.message?.content || 'Sem resposta do modelo.';
    this.pushHistory(msg.sessionKey, history, 'assistant', response);
    return response;
  }

  // ── Anthropic ───────────────────────────────────────────────────────────────

  private async routeViaAnthropic(msg: IncomingMessage, apiModelId?: string, kbContext?: string): Promise<string> {
    const anthropicKey = settingsStore.get('anthropicApiKey');
    if (!anthropicKey) throw new Error('Anthropic API key not configured');

    const history = this.getHistory(msg.sessionKey);
    history.push({ role: 'user', content: msg.text });

    const model = apiModelId || 'claude-haiku-4-5-20251001';
    const res = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: kbContext ? `${SYSTEM_PROMPT(msg)}\n\n${kbContext}` : SYSTEM_PROMPT(msg),
        messages: history.map((h) => ({
          role: h.role === 'assistant' ? 'assistant' : 'user',
          content: h.content,
        })),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[AgentRouter] Anthropic HTTP ${res.status}:`, errText);
      throw new Error(`Anthropic HTTP ${res.status}`);
    }

    const data = await res.json();
    const response = data.content?.[0]?.text || 'Sem resposta do modelo.';
    this.pushHistory(msg.sessionKey, history, 'assistant', response);
    return response;
  }

  // ── Ollama (local) ──────────────────────────────────────────────────────────

  private async routeViaOllama(msg: IncomingMessage, apiModelId?: string, kbContext?: string): Promise<string> {
    const history = this.getHistory(msg.sessionKey);
    history.push({ role: 'user', content: msg.text });

    const ollamaUrl = settingsStore.get('ollamaBaseUrl') || OLLAMA_DEFAULT;
    const model = apiModelId || 'gemma3:4b';

    const res = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: kbContext ? `${SYSTEM_PROMPT(msg)}\n\n${kbContext}` : SYSTEM_PROMPT(msg) },
          ...history,
        ],
        stream: false,
        options: { temperature: 0.5 },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[AgentRouter] Ollama HTTP ${res.status}:`, errText);
      throw new Error(`Ollama HTTP ${res.status}`);
    }

    const data = await res.json();
    const response = data.message?.content || 'Sem resposta do modelo.';
    this.pushHistory(msg.sessionKey, history, 'assistant', response);
    return response;
  }
}
