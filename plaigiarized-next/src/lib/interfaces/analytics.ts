import { StyleMetrics } from './metrics';
import { DetectionResult } from './detection';

export interface Analytics {
    id: string;
    type: AnalyticsType;
    period: {
        start: Date;
        end: Date;
    };
    metrics: AnalyticsMetrics;
    insights: AnalyticsInsight[];
    trends: AnalyticsTrend[];
    predictions: AnalyticsPrediction[];
}

type AnalyticsType = 
    | 'user'
    | 'class'
    | 'institution'
    | 'system'
    | 'detection'
    | 'performance';

interface AnalyticsMetrics {
    usage: {
        activeUsers: number;
        submissions: number;
        detections: number;
        reports: number;
        processingTime: number;
    };
    detection: {
        total: number;
        flagged: number;
        suspicious: number;
        clean: number;
        accuracy: number;
        confidence: number;
    };
    performance: {
        averageResponse: number;
        errorRate: number;
        uptime: number;
        resourceUsage: {
            cpu: number;
            memory: number;
            storage: number;
        };
    };
    quality: {
        accuracy: number;
        precision: number;
        recall: number;
        f1Score: number;
    };
}

interface AnalyticsInsight {
    type: string;
    category: 'performance' | 'detection' | 'usage' | 'trend';
    description: string;
    significance: number;
    metrics: {
        name: string;
        value: number;
        change: number;
        trend: 'up' | 'down' | 'stable';
    }[];
    recommendations: {
        action: string;
        impact: string;
        priority: 'high' | 'medium' | 'low';
    }[];
}

interface AnalyticsTrend {
    metric: string;
    data: {
        timestamp: Date;
        value: number;
        baseline: number;
    }[];
    analysis: {
        pattern: string;
        confidence: number;
        seasonality: boolean;
        anomalies: {
            timestamp: Date;
            value: number;
            severity: number;
        }[];
    };
}

interface AnalyticsPrediction {
    metric: string;
    horizon: 'short' | 'medium' | 'long';
    values: {
        timestamp: Date;
        predicted: number;
        confidence: {
            lower: number;
            upper: number;
        };
    }[];
    factors: {
        name: string;
        impact: number;
        confidence: number;
    }[];
}

export interface SystemAnalytics extends Analytics {
    performance: {
        processing: {
            averageTime: number;
            queueLength: number;
            errorRate: number;
        };
        storage: {
            used: number;
            available: number;
            growth: number;
        };
        api: {
            requests: number;
            latency: number;
            errors: number;
        };
    };
    usage: {
        concurrent: number;
        peak: number;
        distribution: Record<string, number>;
    };
}

export interface DetectionAnalytics extends Analytics {
    patterns: {
        common: Array<{
            pattern: string;
            frequency: number;
            confidence: number;
        }>;
        emerging: Array<{
            pattern: string;
            growth: number;
            significance: number;
        }>;
    };
    accuracy: {
        overall: number;
        byType: Record<string, number>;
        confusion: {
            truePositives: number;
            falsePositives: number;
            trueNegatives: number;
            falseNegatives: number;
        };
    };
    improvements: {
        category: string;
        metric: string;
        current: number;
        target: number;
        actions: string[];
    }[];
}

export interface AnalyticsQuery {
    type: AnalyticsType;
    period: {
        start: Date;
        end: Date;
    };
    metrics?: string[];
    filters?: {
        [key: string]: any;
    };
    groupBy?: string[];
    include?: {
        insights?: boolean;
        trends?: boolean;
        predictions?: boolean;
    };
}

export interface AnalyticsBatch {
    batchId: string;
    queries: AnalyticsQuery[];
    results: Map<string, Analytics>;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: {
        total: number;
        processed: number;
        failed: number;
    };
    metadata: {
        generated: Date;
        duration: number;
        errors: string[];
    };
} 