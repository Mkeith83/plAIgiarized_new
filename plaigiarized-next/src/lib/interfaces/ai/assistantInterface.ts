export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface AssistantResponse {
  content: string;
  confidence: number;
  metadata: {
    model: string;
    processingTime: number;
    tokens: number;
  };
}

export interface FeedbackOptions {
  type: 'grammar' | 'style' | 'content';
  detail: 'basic' | 'detailed';
  focus?: string[];
}

export interface AssistantConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  stopSequences?: string[];
  presencePenalty?: number;
  frequencyPenalty?: number;
} 