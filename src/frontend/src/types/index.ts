export interface TextStats {
  wordCount: number;
  charCount: number;
  sentenceCount: number;
  paragraphCount: number;
}

export interface AnalysisResult {
  score: number;
  confidence: number;
  textStats?: TextStats;
} 