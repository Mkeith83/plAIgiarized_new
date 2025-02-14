export interface VocabularyMetrics {
  uniqueWords: number;
  complexWords: number;
  averageWordLength: number;
  wordFrequencies: Record<string, number>;
  commonWords: string[];
  rareWords: string[];
}

export interface StyleMetrics {
  sentenceCount: number;
  averageSentenceLength: number;
  paragraphCount: number;
  averageParagraphLength: number;
  transitionWords: string[];
  punctuationFrequency: Record<string, number>;
}

export interface ImprovementMetrics {
  vocabularyGrowth: number;
  styleProgress: number;
  readabilityScore: number;
  consistencyScore: number;
}

export interface ClassMetrics {
  averageGradeLevel: number;
  averageWordCount: number;
  improvementRate: number;
  submissionRate: number;
  activeStudents: number;
}

export interface EssayMetrics {
  wordCount: number;
  readabilityScore: number;
  vocabularyComplexity: number;
  styleConsistency: number;
  grammarScore: number;
} 