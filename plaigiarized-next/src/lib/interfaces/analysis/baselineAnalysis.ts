export interface WritingCharacteristics {
  vocabulary: {
    commonWords: Set<string>;
    uniquePhrases: Set<string>;
    complexityScore: number;
    domainSpecificTerms: string[];
    transitionPatterns: string[];
  };
  style: {
    averageSentenceLength: number;
    sentenceComplexity: number;
    paragraphStructure: {
      averageLength: number;
      transitionFrequency: number;
    };
    syntaxPatterns: string[];
    punctuationStyle: Record<string, number>;
  };
  coherence: {
    topicConsistency: number;
    argumentStructure: string[];
    logicalFlow: number;
  };
}

export interface BaselineProfile {
  studentId: string;
  samples: Array<{
    essayId: string;
    characteristics: WritingCharacteristics;
    gradeLevel: number;
    timestamp: string;
  }>;
  aggregateProfile: WritingCharacteristics;
  confidenceMetrics: {
    sampleSize: number;
    consistency: number;
    reliability: number;
  };
} 