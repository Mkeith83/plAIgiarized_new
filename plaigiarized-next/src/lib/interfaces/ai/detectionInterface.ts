export interface DetectionSegment {
  text: string;
  probability: number;
  start: number;
  end: number;
  features: Record<string, unknown>;
}

export interface DetectionMetrics {
  aiProbability: number;
  humanProbability: number;
  confidence: number;
  reliability: number;
}

export interface AIDetectionConfig {
  models: {
    primary: {
      name: string;
      type: 'transformer' | 'lstm' | 'ensemble';
      threshold: number;
      weights: number[];
    };
    fallback: {
      name: string;
      type: 'transformer' | 'lstm' | 'ensemble';
      threshold: number;
    };
  };
  analysis: {
    minLength: number;
    maxSegments: number;
    contextWindow: number;
    batchSize: number;
  };
  thresholds: {
    confidence: number;
    styleDeviation: number;
    vocabularyShift: number;
    syntaxComplexity: number;
  };
  features: {
    useBaseline: boolean;
    trackProgress: boolean;
    detectEvasion: boolean;
    checkPlagiarism: boolean;
  };
}

export interface DetectionResult {
  isAIGenerated: boolean;
  confidence: number;
  segments: Array<{
    text: string;
    probability: number;
    start: number;
    end: number;
    features: Record<string, unknown>;
  }>;
  analysis: {
    style: {
      consistency: number;
      complexity: number;
      patterns: string[];
    };
    vocabulary: {
      diversity: number;
      complexity: number;
      unusualWords: string[];
    };
    baseline: {
      styleDivergence: number;
      vocabularyShift: number;
      overallDeviation: number;
    };
    evasion: {
      techniques: string[];
      confidence: number;
    };
  };
  metadata: {
    modelVersion: string;
    processingTime: number;
    timestamp: string;
  };
}

export interface AdvancedDetectionResult extends DetectionResult {
  baselineComparison: {
    styleDivergence: number;
    vocabularyShift: number;
    syntaxComplexityDelta: number;
    consistencyScore: number;
    anomalyIndicators: Array<{
      type: 'style' | 'vocabulary' | 'syntax' | 'pattern';
      severity: number;
      evidence: string[];
    }>;
  };
}
