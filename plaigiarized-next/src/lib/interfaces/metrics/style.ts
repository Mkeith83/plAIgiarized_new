export interface SentenceStructure {
  length: number;
  complexity: number;
  type: 'simple' | 'compound' | 'complex' | 'compound-complex';
}

export interface StyleMetrics {
  sentenceCount: number;
  averageSentenceLength: number;
  paragraphCount: number;
  averageParagraphLength: number;
  transitionWords: string[];
  punctuationFrequency: Record<string, number>;
  sentenceVariety?: number;
  voiceConsistency?: number;
}

export interface StyleAnalysis {
  metrics: StyleMetrics;
  patterns: {
    sentenceStructures: SentenceStructure[];
    paragraphStructures: Array<{
      sentences: number;
      transitions: number;
      coherence: number;
    }>;
    toneIndicators: Array<{
      type: string;
      frequency: number;
      examples: string[];
    }>;
  };
  improvement: {
    varietyScore: number;
    coherenceScore: number;
    flowScore: number;
  };
} 