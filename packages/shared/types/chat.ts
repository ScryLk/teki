export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sources?: SourceReference[];
  context?: AutoContext;
}

export interface SourceReference {
  title: string;
  index: string;
  objectID: string;
  snippet?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}
