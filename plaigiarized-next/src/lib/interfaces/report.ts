import { DetectionResult } from './detection';
import { StyleMetrics } from './metrics';
import { BaselineComparison } from './baseline';

export interface Report {
    id: string;
    type: ReportType;
    timestamp: Date;
    data: ReportData;
    metadata: ReportMetadata;
    summary: ReportSummary;
    recommendations: ReportRecommendation[];
}

type ReportType = 
    | 'student'
    | 'class'
    | 'assignment'
    | 'course'
    | 'detection'
    | 'analysis'
    | 'trend';

interface ReportData {
    detections?: DetectionReport[];
    analytics?: AnalyticsReport;
    comparisons?: ComparisonReport[];
    trends?: TrendReport;
    metrics?: MetricsReport;
}

interface ReportMetadata {
    generated: {
        by: string;
        at: Date;
        version: string;
    };
    scope: {
        type: string;
        id: string;
        period?: {
            start: Date;
            end: Date;
        };
    };
    filters: Record<string, any>;
    confidence: number;
}

interface ReportSummary {
    highlights: string[];
    concerns: string[];
    metrics: {
        name: string;
        value: number;
        trend: 'up' | 'down' | 'stable';
        significance: number;
    }[];
    status: 'good' | 'warning' | 'critical';
}

interface ReportRecommendation {
    priority: 'high' | 'medium' | 'low';
    category: string;
    action: string;
    rationale: string;
    impact: string;
    implementation: string[];
}

interface DetectionReport {
    documentId: string;
    result: DetectionResult;
    baseline?: BaselineComparison;
    context: {
        assignment: string;
        submission: string;
        timestamp: Date;
    };
    analysis: {
        severity: number;
        confidence: number;
        explanation: string;
    };
}

interface AnalyticsReport {
    overview: {
        total: number;
        flagged: number;
        clean: number;
        pending: number;
    };
    metrics: StyleMetrics;
    distribution: {
        category: string;
        data: Record<string, number>;
        analysis: string;
    }[];
    patterns: {
        common: string[];
        unusual: string[];
        emerging: string[];
    };
}

interface ComparisonReport {
    type: 'baseline' | 'peer' | 'historical';
    target: {
        id: string;
        type: string;
        metrics: StyleMetrics;
    };
    comparison: {
        similarity: number;
        differences: {
            category: string;
            value: number;
            significance: number;
        }[];
        analysis: string;
    };
}

interface TrendReport {
    periods: {
        start: Date;
        end: Date;
        metrics: Record<string, number>;
    }[];
    analysis: {
        overall: string;
        patterns: {
            pattern: string;
            trend: string;
            significance: number;
        }[];
        predictions: {
            metric: string;
            value: number;
            confidence: number;
        }[];
    };
}

interface MetricsReport {
    current: StyleMetrics;
    historical: {
        timestamp: Date;
        metrics: StyleMetrics;
    }[];
    analysis: {
        improvements: string[];
        concerns: string[];
        recommendations: string[];
    };
}

export interface ReportOptions {
    type: ReportType;
    scope: {
        id: string;
        type: string;
        period?: {
            start: Date;
            end: Date;
        };
    };
    include?: {
        detections?: boolean;
        analytics?: boolean;
        comparisons?: boolean;
        trends?: boolean;
        metrics?: boolean;
    };
    format?: 'detailed' | 'summary' | 'minimal';
    filters?: Record<string, any>;
}

export interface ReportBatch {
    batchId: string;
    reports: Report[];
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: {
        total: number;
        completed: number;
        failed: number;
    };
    summary: {
        generated: number;
        errors: string[];
        warnings: string[];
    };
}