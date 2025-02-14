export interface WritingMetrics {
  vocabulary: {
    complexityScore: number;
    consistencyScore: number;
    commonWords: string[];
    unusualWords: string[];
    transitionPhrases: string[];
  };
  syntax: {
    averageSentenceLength: number;
    complexSentences: number;
    consistencyScore: number;
    commonStructures: string[];
  };
  style: {
    punctuationPatterns: string[];
    paragraphStructure: string;
    toneMarkers: string[];
    consistencyScore: number;
  };
}

export interface BaselineData {
  studentId: string;
  establishedDate: string;
  lastUpdated: string;
  metrics: WritingMetrics;
  confidence: number;
  sampleSize: number;
}

export interface StyleChange {
  type: 'vocabulary' | 'syntax' | 'structure' | 'tone';
  description: string;
  severity: 'low' | 'medium' | 'high';
  previousValue: number;
  currentValue: number;
  confidence: number;
} 