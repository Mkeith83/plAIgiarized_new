import { Essay } from '../interfaces/database/models';
import { Logger } from '../services/logger';

interface ProgressResult {
  trend: 'improving' | 'declining' | 'steady';
  improvement: number;
  metrics: {
    vocabulary: {
      trend: string;
      improvement: number;
    };
    style: {
      trend: string;
      improvement: number;
    };
  };
}

export class ProgressAnalyzer {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  public async analyzeProgress(essays: Essay[]): Promise<ProgressResult> {
    try {
      if (essays.length < 2) {
        return {
          trend: 'steady',
          improvement: 0,
          metrics: {
            vocabulary: { trend: 'steady', improvement: 0 },
            style: { trend: 'steady', improvement: 0 }
          }
        };
      }

      // Sort essays by date
      const sortedEssays = [...essays].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );

      // Extract scores
      const vocabularyScores = sortedEssays.map(
        e => e.metrics?.vocabulary?.score || 0
      );
      const styleScores = sortedEssays.map(
        e => e.metrics?.style?.score || 0
      );

      // Calculate improvements
      const vocabularyImprovement = this.calculateImprovement(vocabularyScores);
      const styleImprovement = this.calculateImprovement(styleScores);
      const overallImprovement = (vocabularyImprovement + styleImprovement) / 2;

      return {
        trend: this.calculateTrend([...vocabularyScores, ...styleScores]),
        improvement: overallImprovement,
        metrics: {
          vocabulary: {
            trend: this.calculateTrend(vocabularyScores),
            improvement: vocabularyImprovement
          },
          style: {
            trend: this.calculateTrend(styleScores),
            improvement: styleImprovement
          }
        }
      };
    } catch (error) {
      this.logger.error('Error analyzing progress:', error);
      throw error;
    }
  }

  public calculateTrend(scores: number[]): 'improving' | 'declining' | 'steady' {
    if (scores.length < 2) return 'steady';

    const slope = this.calculateSlope(scores);
    if (slope > 0.05) return 'improving';
    if (slope < -0.05) return 'declining';
    return 'steady';
  }

  private calculateSlope(scores: number[]): number {
    const n = scores.length;
    const indices = Array.from({ length: n }, (_, i) => i);
    
    const sumX = indices.reduce((a, b) => a + b, 0);
    const sumY = scores.reduce((a, b) => a + b, 0);
    const sumXY = indices.reduce((sum, x, i) => sum + x * scores[i], 0);
    const sumXX = indices.reduce((sum, x) => sum + x * x, 0);
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private calculateImprovement(scores: number[]): number {
    if (scores.length < 2) return 0;
    return scores[scores.length - 1] - scores[0];
  }
} 