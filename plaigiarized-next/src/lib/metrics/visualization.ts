import { TimeSeriesPoint } from '../interfaces/analysis/progressInterface';

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    fill?: boolean;
  }>;
}

export interface ChartOptions {
  type: 'line' | 'bar' | 'radar' | 'pie';
  title?: string;
  xLabel?: string;
  yLabel?: string;
  colors?: string[];
  animate?: boolean;
}

export class MetricsVisualizer {
  private defaultColors = [
    '#4299E1', '#48BB78', '#ED8936',
    '#9F7AEA', '#F56565', '#38B2AC'
  ];

  public createTimeSeriesChart(
    data: TimeSeriesPoint[],
    options: ChartOptions
  ): ChartData {
    const labels = data.map(point => 
      new Date(point.timestamp).toLocaleDateString());
    
    return {
      labels,
      datasets: [{
        label: options.title || 'Time Series',
        data: data.map(point => point.value),
        borderColor: options.colors?.[0] || this.defaultColors[0],
        fill: false
      }]
    };
  }

  public createComparisonChart(
    categories: string[],
    values: number[],
    options: ChartOptions
  ): ChartData {
    return {
      labels: categories,
      datasets: [{
        label: options.title || 'Comparison',
        data: values,
        backgroundColor: options.colors || this.defaultColors
      }]
    };
  }

  public createProgressChart(
    initial: number,
    current: number,
    target: number,
    options: ChartOptions
  ): ChartData {
    return {
      labels: ['Initial', 'Current', 'Target'],
      datasets: [{
        label: options.title || 'Progress',
        data: [initial, current, target],
        backgroundColor: options.colors || [
          '#CBD5E0', '#4299E1', '#48BB78'
        ]
      }]
    };
  }

  public createDistributionChart(
    values: number[],
    options: ChartOptions
  ): ChartData {
    const bins = this.createHistogramBins(values);
    
    return {
      labels: bins.map(bin => `${bin.min.toFixed(1)}-${bin.max.toFixed(1)}`),
      datasets: [{
        label: options.title || 'Distribution',
        data: bins.map(bin => bin.count),
        backgroundColor: options.colors?.[0] || this.defaultColors[0]
      }]
    };
  }

  private createHistogramBins(values: number[]): Array<{
    min: number;
    max: number;
    count: number;
  }> {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = Math.ceil(Math.sqrt(values.length));
    const binWidth = (max - min) / binCount;

    const bins = Array.from({ length: binCount }, (_, i) => ({
      min: min + i * binWidth,
      max: min + (i + 1) * binWidth,
      count: 0
    }));

    values.forEach(value => {
      const binIndex = Math.min(
        Math.floor((value - min) / binWidth),
        binCount - 1
      );
      bins[binIndex].count++;
    });

    return bins;
  }
}
