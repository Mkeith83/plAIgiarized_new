import { Logger } from './logger';
import { Essay } from '../interfaces/database/models';
import { ImprovementMetrics } from '../interfaces/metrics';

interface ProgressHistory {
  essayId: string;
  timestamp: Date;
  metrics: {
    vocabulary: number;
    style: number;
    overall: number;
  };
}

export class ProgressService {
  private logger: Logger;
  private history: Map<string, ProgressHistory[]>;

  constructor() {
    this.logger = new Logger();
    this.history = new Map();
  }

  public async trackProgress(studentId: string, essay: Essay): Promise<void> {
    try {
      const history = this.history.get(studentId) || [];
      
      if (essay.metrics) {
        history.push({
          essayId: essay.id,
          timestamp: essay.createdAt,
          metrics: {
            vocabulary: essay.metrics.vocabulary.score,
            style: essay.metrics.style.score,
            overall: (essay.metrics.vocabulary.score + essay.metrics.style.score) / 2
          }
        });
      }

      this.history.set(studentId, history);
    } catch (error) {
      this.logger.error('Error tracking progress:', error);
      throw error;
    }
  }

  public getProgressHistory(studentId: string): ProgressHistory[] {
    return this.history.get(studentId) || [];
  }

  public calculateImprovement(studentId: string): ImprovementMetrics {
    const history = this.getProgressHistory(studentId);
    
    if (history.length < 2) {
      return {
        vocabulary: 0,
        style: 0,
        overall: 0,
        trend: 'steady'
      };
    }

    const first = history[0].metrics;
    const last = history[history.length - 1].metrics;

    const improvement = {
      vocabulary: last.vocabulary - first.vocabulary,
      style: last.style - first.style,
      overall: last.overall - first.overall,
      trend: 'steady' as const
    };

    if (improvement.overall > 0.1) improvement.trend = 'improving';
    if (improvement.overall < -0.1) improvement.trend = 'declining';

    return improvement;
  }
} 