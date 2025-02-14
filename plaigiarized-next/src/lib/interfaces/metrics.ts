export interface VocabularyMetrics {
  uniqueWords: number;
  totalWords: number;
  complexity: number;
  academicWords: number;
  subjectSpecific: number;
  diversity: number;
  sophistication: number;
}

export interface StyleMetrics {
  vocabulary: VocabularyMetrics;
  gradeLevel: GradeLevelMetrics;
  style: StyleAnalysis;
}

export interface GradeLevelMetrics {
  overall: number;
  readability: number;
  complexity: number;
  vocabulary: number;
  structure: number;
}

export interface StyleAnalysis {
  sentenceStructure: {
    averageLength: number;
    complexity: number;
    variety: number;
    patterns: string[];
  };
  paragraphStructure: {
    averageLength: number;
    coherence: number;
    transitions: number;
  };
  writingPatterns: {
    common: string[];
    unique: string[];
    frequency: Record<string, number>;
  };
  tone: {
    formal: number;
    technical: number;
    academic: number;
  };
}

export interface WritingMetrics extends StyleMetrics {
  timestamp: Date;
  confidence: number;
  documentId: string;
}

export interface MetricsComparison {
  similarity: number;
  differences: {
    vocabulary: MetricDifference;
    gradeLevel: MetricDifference;
    style: StyleDifference;
  };
  confidence: number;
}

interface MetricDifference {
  value: number;
  significance: number;
  details: string[];
}

interface StyleDifference {
  overall: number;
  patterns: {
    added: string[];
    removed: string[];
    changed: Array<{
      from: string;
      to: string;
      significance: number;
    }>;
  };
  structure: {
    sentenceChanges: number;
    paragraphChanges: number;
    significance: number;
  };
}

export interface ImprovementMetrics {
  vocabulary: number;
  style: number;
  overall: number;
  trend: 'improving' | 'declining' | 'steady';
}

export interface ClassMetrics {
  averageGradeLevel: number;
  submissionRate: number;
  improvementRate: number;
  activeStudents: number;
}

export interface EssayMetrics {
  vocabulary: VocabularyMetrics;
  style: StyleMetrics;
  improvement?: ImprovementMetrics;
} 