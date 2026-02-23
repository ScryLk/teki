export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiRequestOptions {
  model: string;
  messages: AiMessage[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  jsonMode?: boolean;
  signal?: AbortSignal;
}

export interface AiResponse {
  content: string;
  model: string;
  provider: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  finishReason: 'stop' | 'max_tokens' | 'error';
  latencyMs: number;
  raw?: unknown;
}

export interface AiStreamChunk {
  content: string;
  done: boolean;
  usage?: AiResponse['usage'];
}

export interface AiProvider {
  id: string;
  name: string;

  validateKey(apiKey: string, baseUrl?: string): Promise<{
    valid: boolean;
    error?: string;
    models?: string[];
  }>;

  chat(apiKey: string, options: AiRequestOptions, baseUrl?: string): Promise<AiResponse>;

  chatStream(apiKey: string, options: AiRequestOptions, baseUrl?: string): AsyncGenerator<AiStreamChunk>;

  estimateTokens(text: string): number;
}

// Legacy interface kept for backwards compatibility with existing chat route
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
