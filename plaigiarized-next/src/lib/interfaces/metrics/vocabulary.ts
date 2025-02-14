export interface WordFrequency {
  word: string;
  count: number;
  frequency: number;
}

export interface VocabularyMetrics {
  uniqueWords: number;
  complexWords: number;
  averageWordLength: number;
  wordFrequencies: Record<string, number>;
  commonWords: string[];
  rareWords: string[];
  domainSpecificTerms?: string[];
  readabilityScore?: number;
}

export interface VocabularyAnalysis {
  metrics: VocabularyMetrics;
  patterns: {
    repeatedPhrases: string[];
    transitionWords: string[];
    academicVocabulary: string[];
  };
  improvement: {
    newWords: string[];
    complexityGain: number;
    varietyIncrease: number;
  };
  gradeLevel: {
    current: number;
    target: number;
    progress: number;
  };
} 