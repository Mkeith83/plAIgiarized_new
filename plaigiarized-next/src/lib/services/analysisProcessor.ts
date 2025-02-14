import type { WritingMetrics, StyleChange, BaselineData } from '../interfaces/analysis';
import { Logger } from './logger';

export class AnalysisProcessor {
  private logger: Logger;
  private readonly significantChangeThreshold = 25; // 25% change is significant
  private readonly suspiciousChangeThreshold = 40; // 40% change is suspicious

  constructor() {
    this.logger = new Logger();
  }

  public processSubmissionData(
    currentSubmission: WritingMetrics,
    baseline: BaselineData,
    previousSubmissions: WritingMetrics[]
  ) {
    try {
      const changes = this.detectSignificantChanges(currentSubmission, baseline.metrics);
      const patterns = this.analyzePatternChanges(currentSubmission, previousSubmissions);
      const risk = this.calculateRiskScore(changes, patterns);

      return {
        changes,
        patterns,
        risk,
        summary: this.generateSummary(changes, patterns, risk)
      };
    } catch (error) {
      this.logger.error('Error processing submission data:', error);
      throw error;
    }
  }

  private detectSignificantChanges(
    current: WritingMetrics,
    baseline: WritingMetrics
  ): StyleChange[] {
    const changes: StyleChange[] = [];

    // Check vocabulary changes
    const vocabChange = this.calculatePercentageChange(
      current.vocabulary.complexityScore,
      baseline.vocabulary.complexityScore
    );
    if (Math.abs(vocabChange) > this.significantChangeThreshold) {
      changes.push({
        type: 'vocabulary',
        description: `Vocabulary complexity ${vocabChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(vocabChange).toFixed(1)}%`,
        severity: Math.abs(vocabChange) > this.suspiciousChangeThreshold ? 'high' : 'medium',
        previousValue: baseline.vocabulary.complexityScore,
        currentValue: current.vocabulary.complexityScore,
        confidence: this.calculateConfidence(vocabChange)
      });
    }

    // Add similar checks for syntax and style
    return changes;
  }

  private calculatePercentageChange(current: number, previous: number): number {
    return ((current - previous) / previous) * 100;
  }

  private calculateConfidence(change: number): number {
    // Higher changes should result in higher confidence in the detection
    return Math.min(Math.abs(change) / this.suspiciousChangeThreshold, 1);
  }

  private analyzePatternChanges(
    current: WritingMetrics,
    previous: WritingMetrics[]
  ): Array<{pattern: string; isNew: boolean; confidence: number}> {
    // Implement pattern analysis
    return [];
  }

  private calculateRiskScore(
    changes: StyleChange[],
    patterns: Array<{pattern: string; isNew: boolean; confidence: number}>
  ): number {
    // Implement risk calculation
    return 0;
  }

  private generateSummary(
    changes: StyleChange[],
    patterns: Array<{pattern: string; isNew: boolean; confidence: number}>,
    riskScore: number
  ): string {
    // Generate human-readable summary
    return '';
  }
} 