import { Logger } from '../services/logger';
import { SampleEssay, DetectionFeedback } from '../interfaces/testing/samples';
import { AIDetector } from '../ai/detector';
import { SampleProcessor } from './sampleProcessor';
import { loadVerifiedHumanEssays, loadAIGeneratedEssays, loadMixedEssays } from './sampleData';

interface TestResults {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: {
    truePositives: number;
    falsePositives: number;
    trueNegatives: number;
    falseNegatives: number;
  };
  confidenceDistribution: {
    high: number;
    medium: number;
    low: number;
  };
}

interface AccuracyMetrics {
  overall: TestResults;
  bySource: {
    human: TestResults;
    ai: TestResults;
    mixed: TestResults;
  };
  thresholds: {
    confidence: number;
    minLength: number;
    maxSegments: number;
  };
}

export class AccuracyTesting {
  private logger: Logger;
  private detector: AIDetector;
  private processor: SampleProcessor;

  constructor() {
    this.logger = new Logger();
    this.detector = new AIDetector({
      threshold: 0.8,
      minLength: 50,
      maxSegments: 10
    });
    this.processor = new SampleProcessor();
  }

  public async testHumanEssays(): Promise<TestResults> {
    try {
      const humanEssays = await loadVerifiedHumanEssays();
      const results = await this.runTests(humanEssays, 'human');
      return this.calculateTestResults(results, humanEssays);
    } catch (error) {
      this.logger.error('Error testing human essays:', error);
      throw error;
    }
  }

  public async testAIEssays(): Promise<TestResults> {
    try {
      const aiEssays = await loadAIGeneratedEssays();
      const results = await this.runTests(aiEssays, 'ai');
      return this.calculateTestResults(results, aiEssays);
    } catch (error) {
      this.logger.error('Error testing AI essays:', error);
      throw error;
    }
  }

  public async testMixedEssays(): Promise<TestResults> {
    try {
      const mixedEssays = await loadMixedEssays();
      const results = await this.runTests(mixedEssays, 'mixed');
      return this.calculateTestResults(results, mixedEssays);
    } catch (error) {
      this.logger.error('Error testing mixed essays:', error);
      throw error;
    }
  }

  public async calculateAccuracyMetrics(): Promise<AccuracyMetrics> {
    try {
      const [humanResults, aiResults, mixedResults] = await Promise.all([
        this.testHumanEssays(),
        this.testAIEssays(),
        this.testMixedEssays()
      ]);

      const overall = this.combineResults([humanResults, aiResults, mixedResults]);

      return {
        overall,
        bySource: {
          human: humanResults,
          ai: aiResults,
          mixed: mixedResults
        },
        thresholds: {
          confidence: this.detector.getConfidenceThreshold(),
          minLength: this.detector.getMinLength(),
          maxSegments: this.detector.getMaxSegments()
        }
      };
    } catch (error) {
      this.logger.error('Error calculating accuracy metrics:', error);
      throw error;
    }
  }

  private async runTests(essays: SampleEssay[], expectedSource: string): Promise<any[]> {
    return Promise.all(
      essays.map(essay => this.detector.detectAIContent(essay.content))
    );
  }

  private calculateTestResults(results: any[], samples: SampleEssay[]): TestResults {
    const confusionMatrix = this.calculateConfusionMatrix(results, samples);
    const { precision, recall } = this.calculatePrecisionRecall(confusionMatrix);

    return {
      accuracy: (confusionMatrix.truePositives + confusionMatrix.trueNegatives) / 
                samples.length,
      precision,
      recall,
      f1Score: 2 * (precision * recall) / (precision + recall),
      confusionMatrix,
      confidenceDistribution: this.calculateConfidenceDistribution(results)
    };
  }

  private calculateConfusionMatrix(results: any[], samples: SampleEssay[]) {
    return {
      truePositives: results.filter((r, i) => 
        r.isAIGenerated && samples[i].source === 'ai'
      ).length,
      falsePositives: results.filter((r, i) => 
        r.isAIGenerated && samples[i].source === 'human'
      ).length,
      trueNegatives: results.filter((r, i) => 
        !r.isAIGenerated && samples[i].source === 'human'
      ).length,
      falseNegatives: results.filter((r, i) => 
        !r.isAIGenerated && samples[i].source === 'ai'
      ).length
    };
  }

  private calculatePrecisionRecall(matrix: any) {
    const precision = matrix.truePositives / (matrix.truePositives + matrix.falsePositives);
    const recall = matrix.truePositives / (matrix.truePositives + matrix.falseNegatives);
    return { precision, recall };
  }

  private calculateConfidenceDistribution(results: any[]) {
    return {
      high: results.filter(r => r.confidence > 0.8).length,
      medium: results.filter(r => r.confidence > 0.5 && r.confidence <= 0.8).length,
      low: results.filter(r => r.confidence <= 0.5).length
    };
  }

  private combineResults(results: TestResults[]): TestResults {
    // Implement combined results calculation
    return results[0]; // Placeholder
  }
} 