import { Logger } from './logger';
import { VocabularyMetrics, StyleMetrics } from '../interfaces/metrics';
import type { WritingMetrics, StyleChange } from '../interfaces/analysis';

interface ChartOptions {
  type: 'bar' | 'line' | 'radar' | 'pie';
  title?: string;
  colors?: string[];
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

export class VisualizationService {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  public generateVocabularyChart(metrics: VocabularyMetrics, options?: ChartOptions) {
    try {
      return {
        labels: ['Unique Words', 'Complex Words', 'Average Length'],
        datasets: [{
          label: 'Vocabulary Metrics',
          data: [
            metrics.uniqueWords,
            metrics.complexWords,
            metrics.averageWordLength
          ],
          color: options?.colors?.[0] || '#4299E1'
        }]
      };
    } catch (error) {
      this.logger.error('Error generating vocabulary chart:', error);
      throw error;
    }
  }

  public generateStyleChart(metrics: StyleMetrics, options?: ChartOptions) {
    try {
      return {
        labels: ['Sentences', 'Paragraphs', 'Transitions'],
        datasets: [{
          label: 'Style Metrics',
          data: [
            metrics.sentenceCount,
            metrics.paragraphCount,
            metrics.transitionWords.length
          ],
          color: options?.colors?.[0] || '#9F7AEA'
        }]
      };
    } catch (error) {
      this.logger.error('Error generating style chart:', error);
      throw error;
    }
  }

  public generateProgressChart(data: number[], labels: string[], options?: ChartOptions) {
    try {
      return {
        labels,
        datasets: [{
          label: 'Progress',
          data,
          color: options?.colors?.[0] || '#48BB78'
        }]
      };
    } catch (error) {
      this.logger.error('Error generating progress chart:', error);
      throw error;
    }
  }
}

export const generateMetricsChart = (
  metrics: WritingMetrics[],
  dates: string[]
): ChartData => {
  return {
    labels: dates.map(d => new Date(d).toLocaleDateString()),
    datasets: [
      {
        label: 'Vocabulary Complexity',
        data: metrics.map(m => m.vocabulary.complexityScore),
        color: '#4299E1'
      },
      {
        label: 'Style Consistency',
        data: metrics.map(m => m.style.consistencyScore),
        color: '#48BB78'
      },
      {
        label: 'Syntax Complexity',
        data: metrics.map(m => m.syntax.complexSentences),
        color: '#ED8936'
      }
    ]
  };
};

export const generatePatternDistribution = (metrics: WritingMetrics): {
  common: number;
  new: number;
  missing: number;
} => {
  return {
    common: metrics.syntax.commonStructures.length,
    new: metrics.vocabulary.unusualWords.length,
    missing: 0 // Calculate from baseline comparison
  };
}; 