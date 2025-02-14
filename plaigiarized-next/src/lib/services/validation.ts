import type { WritingMetrics, BaselineData } from '../interfaces/analysis';
import { Logger } from './logger';

export class ValidationService {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  public validateSubmission(metrics: WritingMetrics): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check for required metrics
    if (!this.validateVocabularyMetrics(metrics.vocabulary)) {
      errors.push('Invalid vocabulary metrics');
    }

    if (!this.validateSyntaxMetrics(metrics.syntax)) {
      errors.push('Invalid syntax metrics');
    }

    if (!this.validateStyleMetrics(metrics.style)) {
      errors.push('Invalid style metrics');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  public validateBaseline(baseline: BaselineData): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check baseline requirements
    if (!baseline.studentId) {
      errors.push('Missing student ID');
    }

    if (baseline.sampleSize < 3) {
      errors.push('Insufficient samples for baseline');
    }

    if (baseline.confidence < 0.7) {
      errors.push('Low baseline confidence');
    }

    // Validate baseline metrics
    const metricsValidation = this.validateSubmission(baseline.metrics);
    errors.push(...metricsValidation.errors);

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateVocabularyMetrics(metrics: WritingMetrics['vocabulary']): boolean {
    return (
      typeof metrics.complexityScore === 'number' &&
      typeof metrics.consistencyScore === 'number' &&
      Array.isArray(metrics.commonWords) &&
      Array.isArray(metrics.unusualWords)
    );
  }

  private validateSyntaxMetrics(metrics: WritingMetrics['syntax']): boolean {
    return (
      typeof metrics.averageSentenceLength === 'number' &&
      typeof metrics.complexSentences === 'number' &&
      typeof metrics.consistencyScore === 'number'
    );
  }

  private validateStyleMetrics(metrics: WritingMetrics['style']): boolean {
    return (
      Array.isArray(metrics.punctuationPatterns) &&
      typeof metrics.paragraphStructure === 'string' &&
      Array.isArray(metrics.toneMarkers)
    );
  }
} 