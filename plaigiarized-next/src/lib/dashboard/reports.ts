import { Logger } from '../services/logger';
import { MetricsReport } from '../metrics/reports';
import { ProgressReport } from '../interfaces/analysis/progressInterface';
import { DetectionResult } from '../interfaces/ai/detectionInterface';

export interface ReportOptions {
  includeMetrics?: boolean;
  includeProgress?: boolean;
  includeDetection?: boolean;
  format?: 'detailed' | 'summary' | 'compact';
}

export class ReportGenerator {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  public async generateStudentReport(
    studentId: string,
    timeframe: { start: string; end: string },
    options: ReportOptions = {}
  ): Promise<{
    metrics?: MetricsReport[];
    progress?: ProgressReport;
    detection?: DetectionResult[];
  }> {
    try {
      const report: {
        metrics?: MetricsReport[];
        progress?: ProgressReport;
        detection?: DetectionResult[];
      } = {};

      if (options.includeMetrics) {
        report.metrics = await this.fetchMetricsReports(studentId, timeframe);
      }

      if (options.includeProgress) {
        report.progress = await this.fetchProgressReport(studentId, timeframe);
      }

      if (options.includeDetection) {
        report.detection = await this.fetchDetectionResults(studentId, timeframe);
      }

      return report;
    } catch (error) {
      this.logger.error('Error generating student report', error);
      throw error;
    }
  }

  private async fetchMetricsReports(
    studentId: string,
    timeframe: { start: string; end: string }
  ): Promise<MetricsReport[]> {
    const response = await fetch('/api/reports/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, timeframe })
    });

    if (!response.ok) throw new Error('Failed to fetch metrics reports');
    return response.json();
  }

  private async fetchProgressReport(
    studentId: string,
    timeframe: { start: string; end: string }
  ): Promise<ProgressReport> {
    const response = await fetch('/api/reports/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, timeframe })
    });

    if (!response.ok) throw new Error('Failed to fetch progress report');
    return response.json();
  }

  private async fetchDetectionResults(
    studentId: string,
    timeframe: { start: string; end: string }
  ): Promise<DetectionResult[]> {
    const response = await fetch('/api/reports/detection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, timeframe })
    });

    if (!response.ok) throw new Error('Failed to fetch detection results');
    return response.json();
  }
}
