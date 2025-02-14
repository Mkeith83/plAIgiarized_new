import { Logger } from '../services/logger';
import type { Essay } from '../interfaces/database/models';
import type { ImprovementMetrics } from '../interfaces/metrics';

interface ProgressSnapshot {
  essayId: string;
  timestamp: Date;
  metrics: {
    vocabulary: number;
    style: number;
    overall: number;
  };
}

interface TrendAnalysis {
  trend: 'improving' | 'declining' | 'steady';
  rate: number;
  confidence: number;
  segments: Array<{
    start: Date;
    end: Date;
    trend: 'improving' | 'declining' | 'steady';
    change: number;
  }>;
}

export class ProgressTracker {
  private logger: Logger;
  private history: Map<string, ProgressSnapshot[]>;
  private readonly minSamples = 3;
  private readonly significanceThreshold = 0.1;

  constructor() {
    this.logger = new Logger();
    this.history = new Map();
  }

  public async trackProgress(studentId: string, essay: Essay): Promise<void> {
    try {
      if (!essay.metrics) {
        throw new Error('Essay metrics not available');
      }

      const snapshot: ProgressSnapshot = {
        essayId: essay.id,
        timestamp: essay.createdAt,
        metrics: {
          vocabulary: essay.metrics.vocabulary.score,
          style: essay.metrics.style.score,
          overall: (essay.metrics.vocabulary.score + essay.metrics.style.score) / 2
        }
      };

      const history = this.history.get(studentId) || [];
      history.push(snapshot);
      this.history.set(studentId, history);

    } catch (error) {
      this.logger.error('Error tracking progress:', error);
      throw error;
    }
  }

  public async analyzeProgress(studentId: string): Promise<ImprovementMetrics> {
    try {
      const history = this.history.get(studentId) || [];
      
      if (history.length < this.minSamples) {
        return {
          vocabulary: 0,
          style: 0,
          overall: 0,
          trend: 'steady'
        };
      }

      const sortedHistory = [...history].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );

      const first = sortedHistory[0].metrics;
      const last = sortedHistory[sortedHistory.length - 1].metrics;
      const trend = this.analyzeTrend(sortedHistory);

      return {
        vocabulary: last.vocabulary - first.vocabulary,
        style: last.style - first.style,
        overall: last.overall - first.overall,
        trend: trend.trend
      };

    } catch (error) {
      this.logger.error('Error analyzing progress:', error);
      throw error;
    }
  }

  private analyzeTrend(history: ProgressSnapshot[]): TrendAnalysis {
    const overallScores = history.map(h => h.metrics.overall);
    const timestamps = history.map(h => h.timestamp.getTime());
    
    // Calculate linear regression
    const n = history.length;
    const sumX = timestamps.reduce((a, b) => a + b, 0);
    const sumY = overallScores.reduce((a, b) => a + b, 0);
    const sumXY = timestamps.reduce((sum, x, i) => sum + x * overallScores[i], 0);
    const sumXX = timestamps.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const rate = slope * (1000 * 60 * 60 * 24); // Convert to change per day

    // Analyze segments
    const segments = this.analyzeSegments(history);

    return {
      trend: this.determineTrend(rate),
      rate,
      confidence: this.calculateConfidence(history),
      segments
    };
  }

  private analyzeSegments(history: ProgressSnapshot[]): TrendAnalysis['segments'] {
    if (history.length < 2) return [];

    const segments: TrendAnalysis['segments'] = [];
    let segmentStart = 0;

    for (let i = 1; i < history.length; i++) {
      const change = history[i].metrics.overall - history[i-1].metrics.overall;
      const timeDiff = history[i].timestamp.getTime() - history[i-1].timestamp.getTime();
      const rate = change / timeDiff;

      if (
        i === history.length - 1 || 
        Math.abs(rate) > this.significanceThreshold
      ) {
        segments.push({
          start: history[segmentStart].timestamp,
          end: history[i].timestamp,
          trend: this.determineTrend(rate),
          change: history[i].metrics.overall - history[segmentStart].metrics.overall
        });
        segmentStart = i;
      }
    }

    return segments;
  }

  private determineTrend(rate: number): 'improving' | 'declining' | 'steady' {
    if (rate > this.significanceThreshold) return 'improving';
    if (rate < -this.significanceThreshold) return 'declining';
    return 'steady';
  }

  private calculateConfidence(history: ProgressSnapshot[]): number {
    // Calculate confidence based on:
    // 1. Number of samples
    // 2. Consistency of trend
    // 3. Time span covered
    const sampleConfidence = Math.min(history.length / (this.minSamples * 2), 1);
    
    const trends = history.slice(1).map((h, i) => {
      const prev = history[i];
      return h.metrics.overall - prev.metrics.overall;
    });
    
    const consistencyConfidence = trends.reduce((acc, trend, i) => {
      if (i === 0) return 1;
      return acc * (Math.sign(trend) === Math.sign(trends[i-1]) ? 1 : 0.8);
    }, 1);

    const timeSpan = history[history.length - 1].timestamp.getTime() - 
                     history[0].timestamp.getTime();
    const timeConfidence = Math.min(timeSpan / (30 * 24 * 60 * 60 * 1000), 1);

    return (sampleConfidence + consistencyConfidence + timeConfidence) / 3;
  }
}
