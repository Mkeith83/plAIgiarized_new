import { VocabularyMetrics, StyleMetrics } from '../metrics';

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
  metadata?: Record<string, unknown>;
}

export interface ProgressMetrics {
  vocabulary: {
    uniqueWordGrowth: TimeSeriesPoint[];
    complexityTrend: TimeSeriesPoint[];
    varietyScore: TimeSeriesPoint[];
  };
  style: {
    readabilityTrend: TimeSeriesPoint[];
    structureImprovement: TimeSeriesPoint[];
    consistencyScore: TimeSeriesPoint[];
  };
  overall: {
    improvement: TimeSeriesPoint[];
    confidence: TimeSeriesPoint[];
  };
}

export interface ProgressReport {
  id: string;
  studentId: string;
  periodStart: string;
  periodEnd: string;
  metrics: ProgressMetrics;
  baseline: {
    initial: {
      vocabulary: VocabularyMetrics;
      style: StyleMetrics;
    };
    current: {
      vocabulary: VocabularyMetrics;
      style: StyleMetrics;
    };
  };
  analysis: {
    trends: {
      shortTerm: string[];
      longTerm: string[];
    };
    recommendations: string[];
    flags: string[];
  };
}

export interface StudentProgress {
  studentId: string;
  baseline: {
    timestamp: string;
    gradeLevel: number;
    metrics: Record<string, number>;
  };
  current: {
    timestamp: string;
    gradeLevel: number;
    metrics: Record<string, number>;
  };
  improvements: {
    vocabulary: {
      growth: number;
      newWords: string[];
      complexityIncrease: number;
    };
    style: {
      improvement: number;
      newPatterns: string[];
      consistencyChange: number;
    };
    overall: {
      gradeLevelChange: number;
      confidenceScore: number;
    };
  };
  timeline: Array<{
    timestamp: string;
    metrics: Record<string, number>;
    significant: boolean;
  }>;
  flags: {
    type: 'improvement' | 'concern' | 'warning';
    message: string;
    timestamp: string;
  }[];
}

export interface ClassProgress {
  classId: string;
  period: {
    start: string;
    end: string;
  };
  overall: {
    averageImprovement: number;
    consistencyScore: number;
    confidenceLevel: number;
  };
  students: {
    improved: number;
    steady: number;
    declining: number;
  };
  metrics: {
    vocabulary: number;
    style: number;
    gradeLevel: number;
  };
  distribution: {
    percentiles: number[];
    ranges: Array<{
      min: number;
      max: number;
      count: number;
    }>;
  };
}
