export interface ComparisonResult {
  id: string;
  essayId: string;
  baselineId: string;
  timestamp: string;
  metrics: {
    vocabulary: {
      similarity: number;
      improvements: {
        uniqueWords: number;
        complexWords: number;
        wordLength: number;
      };
      newPatterns: string[];
    };
    style: {
      similarity: number;
      improvements: {
        sentenceVariety: number;
        paragraphStructure: number;
        transitionUse: number;
      };
      changes: string[];
    };
  };
  overall: {
    similarity: number;
    improvement: number;
    confidence: number;
  };
  flags: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    location?: {
      start: number;
      end: number;
    };
  }>;
}
