import { ChartData, ChartOptions } from '../metrics/visualization';
import { TimeSeriesPoint } from '../interfaces/analysis/progressInterface';
import { Logger } from '../services/logger';

export class ChartGenerator {
  private logger: Logger;
  private defaultColors = [
    '#4299E1', '#48BB78', '#ED8936',
    '#9F7AEA', '#F56565', '#38B2AC'
  ];

  constructor() {
    this.logger = new Logger();
  }

  public generateProgressChart(
    data: TimeSeriesPoint[],
    options: Partial<ChartOptions> = {}
  ): ChartData {
    try {
      const labels = data.map(point => 
        new Date(point.timestamp).toLocaleDateString());
      
      return {
        labels,
        datasets: [{
          label: options.title || 'Progress Over Time',
          data: data.map(point => point.value),
          borderColor: options.colors?.[0] || this.defaultColors[0],
          fill: false
        }]
      };
    } catch (error) {
      this.logger.error('Error generating progress chart', error);
      throw error;
    }
  }

  public generateComparisonChart(
    labels: string[],
    datasets: Array<{
      label: string;
      data: number[];
      color?: string;
    }>,
    options: Partial<ChartOptions> = {}
  ): ChartData {
    try {
      return {
        labels,
        datasets: datasets.map((dataset, index) => ({
          label: dataset.label,
          data: dataset.data,
          backgroundColor: dataset.color || this.defaultColors[index % this.defaultColors.length]
        }))
      };
    } catch (error) {
      this.logger.error('Error generating comparison chart', error);
      throw error;
    }
  }

  public generateDistributionChart(
    data: number[],
    options: Partial<ChartOptions> = {}
  ): ChartData {
    try {
      const { bins, labels } = this.createHistogramData(data);
      
      return {
        labels,
        datasets: [{
          label: options.title || 'Distribution',
          data: bins,
          backgroundColor: options.colors?.[0] || this.defaultColors[0]
        }]
      };
    } catch (error) {
      this.logger.error('Error generating distribution chart', error);
      throw error;
    }
  }

  public generateRadarChart(
    categories: string[],
    values: number[],
    options: Partial<ChartOptions> = {}
  ): ChartData {
    try {
      return {
        labels: categories,
        datasets: [{
          label: options.title || 'Metrics',
          data: values,
          backgroundColor: `${options.colors?.[0] || this.defaultColors[0]}40`,
          borderColor: options.colors?.[0] || this.defaultColors[0],
          fill: true
        }]
      };
    } catch (error) {
      this.logger.error('Error generating radar chart', error);
      throw error;
    }
  }

  private createHistogramData(data: number[]): {
    bins: number[];
    labels: string[];
  } {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binCount = Math.ceil(Math.sqrt(data.length));
    const binWidth = (max - min) / binCount;

    const bins = new Array(binCount).fill(0);
    const labels = Array.from({ length: binCount }, (_, i) => 
      `${(min + i * binWidth).toFixed(1)}-${(min + (i + 1) * binWidth).toFixed(1)}`
    );

    data.forEach(value => {
      const binIndex = Math.min(
        Math.floor((value - min) / binWidth),
        binCount - 1
      );
      bins[binIndex]++;
    });

    return { bins, labels };
  }
} 