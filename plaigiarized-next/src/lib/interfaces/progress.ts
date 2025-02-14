import { VocabularyMetrics, StyleMetrics } from './metrics';

export interface ProgressSnapshot {
  timestamp: string;
  metrics: {
    vocabulary: VocabularyMetrics;
    style: StyleMetrics;
    improvement: number;
    consistency: number;
  };
  essayId: string;
}

export interface ProgressHistory {
  studentId: string;
  snapshots: ProgressSnapshot[];
  lastUpdated: string;
} 