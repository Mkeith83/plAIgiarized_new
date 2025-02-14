import { StyleMetrics } from '../interfaces/metrics';
import { Logger } from '../services/logger';

interface StatisticalMetrics {
  mean: number;
  median: number;
  standardDeviation: number;
  quartiles: [number, number, number];
  range: number;
}

interface TrendAnalysis {
  slope: number;
  correlation: number;
  significance: number;
  forecast: number[];
}

export class StyleAnalytics {
  private logger: Logger;
  private readonly minDataPoints = 3;
  private readonly confidenceLevel = 0.95;
  private transitionWords: Set<string>;
  private punctuationMarks: Set<string>;

  constructor() {
    this.logger = new Logger();
    this.transitionWords = new Set([
      'however', 'therefore', 'furthermore',
      'moreover', 'nevertheless', 'meanwhile'
    ]);
    this.punctuationMarks = new Set(['.', ',', ';', ':', '!', '?']);
  }

  public analyzeStyle(text: string): StyleMetrics {
    const sentences = text.split(/[.!?]+/).filter(Boolean);
    const paragraphs = text.split(/\n\s*\n/);
    const words = text.split(/\s+/);

    return {
      sentenceCount: sentences.length,
      averageSentenceLength: words.length / sentences.length,
      paragraphCount: paragraphs.length,
      averageParagraphLength: words.length / paragraphs.length,
      transitionWords: this.findTransitionWords(text),
      punctuationFrequency: this.analyzePunctuation(text)
    };
  }

  public calculateReadabilityScore(text: string): number {
    const words = text.split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(Boolean);
    const syllables = words.reduce((sum, word) => 
      sum + this.countSyllables(word), 0);

    // Flesch-Kincaid Grade Level
    return 0.39 * (words.length / sentences.length) 
      + 11.8 * (syllables / words.length) - 15.59;
  }

  public analyzeTimeSeries(data: number[]): StatisticalMetrics & TrendAnalysis {
    try {
      if (data.length < this.minDataPoints) {
        throw new Error(`Need at least ${this.minDataPoints} data points for analysis`);
      }

      const sortedData = [...data].sort((a, b) => a - b);
      const stats = this.calculateStatistics(sortedData);
      const trend = this.analyzeTrend(data);

      return {
        ...stats,
        ...trend
      };
    } catch (error) {
      this.logger.error('Error analyzing time series:', error);
      throw error;
    }
  }

  private findTransitionWords(text: string): string[] {
    return text.toLowerCase()
      .split(/\s+/)
      .filter(word => this.transitionWords.has(word));
  }

  private analyzePunctuation(text: string): Record<string, number> {
    return text.split('').reduce((freq, char) => {
      if (this.punctuationMarks.has(char)) {
        freq[char] = (freq[char] || 0) + 1;
      }
      return freq;
    }, {} as Record<string, number>);
  }

  private countSyllables(word: string): number {
    return word.toLowerCase()
      .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
      .match(/[aeiouy]{1,2}/g)?.length || 0;
  }

  private calculateStatistics(sortedData: number[]): StatisticalMetrics {
    const n = sortedData.length;
    const mean = sortedData.reduce((sum, val) => sum + val, 0) / n;
    const median = this.calculateMedian(sortedData);
    const variance = this.calculateVariance(sortedData, mean);

    return {
      mean,
      median,
      standardDeviation: Math.sqrt(variance),
      quartiles: this.calculateQuartiles(sortedData),
      range: sortedData[n - 1] - sortedData[0]
    };
  }

  private calculateMedian(sortedData: number[]): number {
    const mid = Math.floor(sortedData.length / 2);
    return sortedData.length % 2 === 0
      ? (sortedData[mid - 1] + sortedData[mid]) / 2
      : sortedData[mid];
  }

  private calculateVariance(data: number[], mean: number): number {
    return data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  }

  private calculateQuartiles(sortedData: number[]): [number, number, number] {
    const n = sortedData.length;
    return [
      this.calculateMedian(sortedData.slice(0, Math.floor(n / 2))),
      this.calculateMedian(sortedData),
      this.calculateMedian(sortedData.slice(Math.ceil(n / 2)))
    ];
  }

  private analyzeTrend(data: number[]): TrendAnalysis {
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const slope = this.calculateSlope(x, data);
    const correlation = this.calculateCorrelation(x, data);

    return {
      slope,
      correlation,
      significance: this.calculateSignificance(correlation, n),
      forecast: this.generateForecast(data, slope)
    };
  }

  private calculateSlope(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const xMean = x.reduce((a, b) => a + b, 0) / x.length;
    const yMean = y.reduce((a, b) => a + b, 0) / y.length;

    const numerator = x.reduce((sum, xi, i) => 
      sum + (xi - xMean) * (y[i] - yMean), 0);
    const denominator = Math.sqrt(
      x.reduce((sum, xi) => sum + Math.pow(xi - xMean, 2), 0) *
      y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0)
    );

    return numerator / denominator;
  }

  private calculateSignificance(correlation: number, n: number): number {
    const t = correlation * Math.sqrt((n - 2) / (1 - correlation * correlation));
    // Simplified t-distribution approximation
    return 1 - Math.exp(-t * t / 2);
  }

  private generateForecast(data: number[], slope: number): number[] {
    const lastValue = data[data.length - 1];
    return Array.from({ length: 3 }, (_, i) => lastValue + slope * (i + 1));
  }
}
