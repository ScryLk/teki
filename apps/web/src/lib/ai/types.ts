export interface ProviderMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  image?: { base64: string; mimeType: 'image/jpeg' | 'image/png' };
}

export interface ProviderRequest {
  model: string;
  messages: ProviderMessage[];
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
  stream: boolean;
}

export interface ProviderResponse {
  content: string;
  model: string;
  usage?: { inputTokens: number; outputTokens: number };
}

export interface AIProviderInterface {
  id: string;
  chat(request: ProviderRequest): Promise<ProviderResponse>;
  chatStream(request: ProviderRequest): Promise<ReadableStream<Uint8Array>>;
}
