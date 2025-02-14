export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  animation?: {
    duration: number;
    easing: string;
  };
  scales?: {
    y?: {
      beginAtZero: boolean;
    };
  };
  plugins?: {
    legend?: {
      position: 'top' | 'bottom' | 'left' | 'right';
    };
    tooltip?: {
      mode: 'index' | 'point' | 'nearest';
      intersect: boolean;
    };
  };
}

export interface ChartDataset {
  label?: string;
  data: number[];
  borderColor?: string | string[];
  backgroundColor?: string | string[];
  tension?: number;
  borderWidth?: number;
  fill?: boolean;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
} 