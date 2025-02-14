import { VocabularyMetrics, StyleMetrics } from '../interfaces/metrics';

export function calculateSimilarity(
  metrics1: { vocabulary: VocabularyMetrics; style: StyleMetrics },
  metrics2: { vocabulary: VocabularyMetrics; style: StyleMetrics }
): number {
  const vocabSimilarity = compareVocabularyMetrics(metrics1.vocabulary, metrics2.vocabulary);
  const styleSimilarity = compareStyleMetrics(metrics1.style, metrics2.style);
  
  return (vocabSimilarity + styleSimilarity) / 2;
}

export function compareVocabularyMetrics(m1: VocabularyMetrics, m2: VocabularyMetrics): number {
  const metrics = [
    Math.abs(1 - (m1.uniqueWords / m2.uniqueWords)),
    Math.abs(1 - (m1.complexWords / m2.complexWords)),
    Math.abs(1 - (m1.averageWordLength / m2.averageWordLength))
  ];
  
  return metrics.reduce((sum, val) => sum + val, 0) / metrics.length;
}

export function compareStyleMetrics(m1: StyleMetrics, m2: StyleMetrics): number {
  const metrics = [
    Math.abs(1 - (m1.averageSentenceLength / m2.averageSentenceLength)),
    Math.abs(1 - (m1.averageParagraphLength / m2.averageParagraphLength))
  ];
  
  return metrics.reduce((sum, val) => sum + val, 0) / metrics.length;
}

export function normalizeScore(score: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, score));
}

export function calculateConfidence(
  sampleSize: number,
  variance: number,
  threshold = 0.8
): number {
  const confidence = 1 - (variance / sampleSize);
  return normalizeScore(confidence, 0, threshold);
} 