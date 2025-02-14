export interface AIModelConfig {
  name: string;
  version: string;
  provider: string;
  type: 'detection' | 'analysis' | 'feedback';
  endpoint: string;
  apiKey?: string;
  parameters: {
    maxLength: number;
    temperature: number;
    topP: number;
    [key: string]: unknown;
  };
}

export interface AIProviderStatus {
  name: string;
  isActive: boolean;
  lastCheck: string;
  performance: {
    latency: number;
    reliability: number;
    costPerRequest: number;
  };
  quotas: {
    daily: number;
    remaining: number;
    resetTime: string;
  };
  errors?: Array<{
    code: string;
    message: string;
    timestamp: string;
  }>;
}

export interface AIIntegrationConfig {
  id: string;
  models: AIModelConfig[];
  providers: AIProviderStatus[];
  settings: {
    defaultModel: string;
    fallbackModel: string;
    retryAttempts: number;
    timeoutSeconds: number;
    cacheResults: boolean;
  };
  monitoring: {
    alertThresholds: {
      latency: number;
      errorRate: number;
      costLimit: number;
    };
    notifications: {
      email: string[];
      webhook?: string;
    };
  };
}

export interface DocumentInput {
  content: string;
  type: 'essay' | 'report' | 'analysis';
  metadata?: {
    author?: string;
    date?: string;
    context?: string;
    [key: string]: unknown;
  };
}

export interface ProcessingResult {
  success: boolean;
  score?: number;
  confidence: number;
  analysis: {
    aiProbability: number;
    humanProbability: number;
    segments: Array<{
      text: string;
      score: number;
      start: number;
      end: number;
    }>;
  };
  metadata: {
    processingTime: number;
    modelVersion: string;
    timestamp: string;
  };
}

export interface IntegrationConfig {
  providers: Array<{
    name: string;
    apiKey: string;
    baseUrl: string;
    models: string[];
    enabled: boolean;
  }>;
  defaults: {
    provider: string;
    model: string;
    timeout: number;
    retries: number;
  };
}
