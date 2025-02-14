import { Logger } from '../services/logger';
import { 
  SampleEssay, 
  SampleSet, 
  DetectionFeedback, 
  VerificationResult 
} from '../interfaces/testing/samples';
import { SampleProcessor } from './sampleProcessor';

export class VerificationSystem {
  private logger: Logger;
  private processor: SampleProcessor;
  private feedbackHistory: Map<string, DetectionFeedback[]>;
  private verifiedSamples: Map<string, SampleSet>;

  constructor() {
    this.logger = new Logger();
    this.processor = new SampleProcessor();
    this.feedbackHistory = new Map();
    this.verifiedSamples = new Map();
  }

  public async verifySampleSet(sampleSet: SampleSet): Promise<{
    results: VerificationResult[];
    metrics: {
      accuracy: number;
      precision: number;
      recall: number;
      f1Score: number;
    };
  }> {
    try {
      const results = await this.processor.processSampleSet(sampleSet);
      const metrics = this.calculateMetrics(results, sampleSet);

      this.storeFeedback(results);
      this.updateVerifiedSamples(sampleSet, results);

      return { results, metrics };
    } catch (error) {
      this.logger.error('Error verifying sample set:', error);
      throw error;
    }
  }

  public getFeedbackHistory(sampleId: string): DetectionFeedback[] {
    return this.feedbackHistory.get(sampleId) || [];
  }

  public getVerifiedSamples(): SampleSet[] {
    return Array.from(this.verifiedSamples.values());
  }

  private calculateMetrics(results: VerificationResult[], sampleSet: SampleSet) {
    const truePositives = results.filter(r => 
      r.predictions[0].source === 'ai' && 
      sampleSet.essays.find(e => e.id === r.sampleId)?.source === 'ai'
    ).length;

    const falsePositives = results.filter(r =>
      r.predictions[0].source === 'ai' &&
      sampleSet.essays.find(e => e.id === r.sampleId)?.source !== 'ai'
    ).length;

    const falseNegatives = results.filter(r =>
      r.predictions[0].source !== 'ai' &&
      sampleSet.essays.find(e => e.id === r.sampleId)?.source === 'ai'
    ).length;

    const precision = truePositives / (truePositives + falsePositives);
    const recall = truePositives / (truePositives + falseNegatives);

    return {
      accuracy: results.reduce((sum, r) => sum + r.accuracy, 0) / results.length,
      precision,
      recall,
      f1Score: 2 * (precision * recall) / (precision + recall)
    };
  }

  private storeFeedback(results: VerificationResult[]): void {
    results.forEach(result => {
      if (result.feedback) {
        const history = this.feedbackHistory.get(result.sampleId) || [];
        history.push(result.feedback);
        this.feedbackHistory.set(result.sampleId, history);
      }
    });
  }

  private updateVerifiedSamples(sampleSet: SampleSet, results: VerificationResult[]): void {
    const verifiedSet = {
      ...sampleSet,
      essays: sampleSet.essays.map(essay => ({
        ...essay,
        metadata: {
          ...essay.metadata,
          verified: results.some(r => 
            r.sampleId === essay.id && 
            r.feedback?.teacherVerified
          )
        }
      }))
    };

    this.verifiedSamples.set(sampleSet.id, verifiedSet);
  }
} 