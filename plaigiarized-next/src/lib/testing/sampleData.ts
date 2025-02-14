import { Logger } from '../services/logger';
import { SampleEssay } from '../interfaces/testing/samples';
import { DatabaseService } from '../services/database';

interface ValidationResults {
  valid: boolean;
  errors: string[];
  stats: {
    totalSamples: number;
    validSamples: number;
    humanSamples: number;
    aiSamples: number;
    mixedSamples: number;
    averageLength: number;
    verificationRate: number;
  };
}

export class SampleDataManager {
  private logger: Logger;
  private db: DatabaseService;
  private cache: Map<string, SampleEssay[]>;

  constructor() {
    this.logger = new Logger();
    this.db = new DatabaseService({ url: process.env.DATABASE_URL });
    this.cache = new Map();
  }

  public async loadVerifiedHumanEssays(): Promise<SampleEssay[]> {
    try {
      if (this.cache.has('human')) {
        return this.cache.get('human')!;
      }

      const essays = await this.db.getSamples({
        source: 'human',
        verified: true
      });

      this.cache.set('human', essays);
      return essays;
    } catch (error) {
      this.logger.error('Error loading human essays:', error);
      throw error;
    }
  }

  public async loadAIGeneratedEssays(): Promise<SampleEssay[]> {
    try {
      if (this.cache.has('ai')) {
        return this.cache.get('ai')!;
      }

      const essays = await this.db.getSamples({
        source: 'ai',
        verified: true
      });

      this.cache.set('ai', essays);
      return essays;
    } catch (error) {
      this.logger.error('Error loading AI essays:', error);
      throw error;
    }
  }

  public async loadMixedEssays(): Promise<SampleEssay[]> {
    try {
      if (this.cache.has('mixed')) {
        return this.cache.get('mixed')!;
      }

      const essays = await this.db.getSamples({
        source: 'mixed',
        verified: true
      });

      this.cache.set('mixed', essays);
      return essays;
    } catch (error) {
      this.logger.error('Error loading mixed essays:', error);
      throw error;
    }
  }

  public async validateSamples(): Promise<ValidationResults> {
    try {
      const allSamples = await this.loadAllSamples();
      const errors: string[] = [];
      let validCount = 0;

      // Validate each sample
      allSamples.forEach(sample => {
        const sampleErrors = this.validateSample(sample);
        if (sampleErrors.length === 0) {
          validCount++;
        } else {
          errors.push(...sampleErrors.map(e => `Sample ${sample.id}: ${e}`));
        }
      });

      // Calculate stats
      const stats = this.calculateStats(allSamples, validCount);

      return {
        valid: errors.length === 0,
        errors,
        stats
      };
    } catch (error) {
      this.logger.error('Error validating samples:', error);
      throw error;
    }
  }

  private async loadAllSamples(): Promise<SampleEssay[]> {
    const [human, ai, mixed] = await Promise.all([
      this.loadVerifiedHumanEssays(),
      this.loadAIGeneratedEssays(),
      this.loadMixedEssays()
    ]);

    return [...human, ...ai, ...mixed];
  }

  private validateSample(sample: SampleEssay): string[] {
    const errors: string[] = [];

    if (!sample.id) errors.push('Missing ID');
    if (!sample.content) errors.push('Missing content');
    if (!['human', 'ai', 'mixed'].includes(sample.source)) {
      errors.push('Invalid source');
    }
    if (!sample.metadata) errors.push('Missing metadata');
    if (typeof sample.metadata.verified !== 'boolean') {
      errors.push('Missing verification status');
    }

    return errors;
  }

  private calculateStats(samples: SampleEssay[], validCount: number) {
    return {
      totalSamples: samples.length,
      validSamples: validCount,
      humanSamples: samples.filter(s => s.source === 'human').length,
      aiSamples: samples.filter(s => s.source === 'ai').length,
      mixedSamples: samples.filter(s => s.source === 'mixed').length,
      averageLength: this.calculateAverageLength(samples),
      verificationRate: samples.filter(s => s.metadata.verified).length / samples.length
    };
  }

  private calculateAverageLength(samples: SampleEssay[]): number {
    const totalLength = samples.reduce((sum, sample) => 
      sum + sample.content.length, 0
    );
    return totalLength / samples.length;
  }
}

// Export convenience functions
export const loadVerifiedHumanEssays = async (): Promise<SampleEssay[]> => {
  const manager = new SampleDataManager();
  return manager.loadVerifiedHumanEssays();
};

export const loadAIGeneratedEssays = async (): Promise<SampleEssay[]> => {
  const manager = new SampleDataManager();
  return manager.loadAIGeneratedEssays();
};

export const loadMixedEssays = async (): Promise<SampleEssay[]> => {
  const manager = new SampleDataManager();
  return manager.loadMixedEssays();
};

export const validateSamples = async (): Promise<ValidationResults> => {
  const manager = new SampleDataManager();
  return manager.validateSamples();
}; 