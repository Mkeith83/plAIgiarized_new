import type { VocabularyMetrics, StyleMetrics } from '../metrics';

export interface BaselineSample {
  essayId: string;
  timestamp: string;
  metrics: {
    vocabulary: VocabularyMetrics;
    style: StyleMetrics;
  };
}

export interface BaselineMetrics {
  vocabulary: VocabularyMetrics;
  style: StyleMetrics;
  confidence: number;
}

export interface BaselineProfile {
  studentId: string;
  essays: Array<{
    id: string;
    timestamp: string;
    metrics: {
      gradeLevel: number;
      readability: number;
      complexity: number;
    };
    style: {
      sentencePatterns: string[];
      transitionUsage: Record<string, number>;
      structuralComplexity: number;
    };
    vocabulary: {
      uniqueWords: Set<string>;
      commonPhrases: string[];
      complexity: number;
    };
  }>;
  aggregateMetrics: {
    averageGradeLevel: number;
    styleConsistency: number;
    vocabularyGrowth: number;
    overallProgress: number;
  };
  confidence: number;
  lastUpdated: string;
}

export interface BaselineComparison {
  similarity: number;
  differences: {
    style: {
      patternChanges: string[];
      complexityDelta: number;
      consistencyScore: number;
    };
    vocabulary: {
      newWords: string[];
      removedWords: string[];
      complexityChange: number;
    };
    metrics: {
      gradeLevelChange: number;
      readabilityChange: number;
      overallChange: number;
    };
  };
  flags: {
    suddenImprovements: string[];
    inconsistencies: string[];
    warnings: string[];
  };
  confidence: number;
}

export interface BaselineConfig {
  minSamples: number;
  maxSamples: number;
  minConfidence: number;
  updateThreshold: number;
  expirationDays: number;
}
