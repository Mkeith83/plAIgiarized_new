import { StyleMetrics } from './metrics';
import { BaselineComparison } from './baseline';

export interface DetectionResult {
    score: number;              // 0-1 probability of AI generation
    confidence: number;         // 0-1 confidence in the detection
    signals: DetectionSignal[];
    analysis: StyleAnalysis;
    comparison?: BaselineComparison;
    metadata: DetectionMetadata;
    explanation: string;        // Human-readable explanation
    recommendations: string[];  // Improvement suggestions
}

interface DetectionSignal {
    type: DetectionSignalType;
    name: string;
    description: string;
    confidence: number;
    evidence: Evidence[];
    location?: TextLocation;
}

type DetectionSignalType = 
    | 'pattern'
    | 'vocabulary'
    | 'style'
    | 'consistency'
    | 'structure'
    | 'evasion'
    | 'technical';

interface Evidence {
    type: 'text' | 'metric' | 'pattern';
    description: string;
    value: any;
    threshold?: number;
    significance: number;
}

interface TextLocation {
    start: number;
    end: number;
    context: string;
}

interface StyleAnalysis {
    metrics: StyleMetrics;
    patterns: {
        identified: Pattern[];
        unusual: Pattern[];
        missing: string[];
    };
    consistency: ConsistencyAnalysis;
    evasionTechniques: EvasionAnalysis;
}

interface Pattern {
    type: string;
    pattern: string;
    frequency: number;
    significance: number;
    locations: TextLocation[];
}

interface ConsistencyAnalysis {
    score: number;
    variations: {
        type: string;
        description: string;
        severity: number;
        examples: string[];
    }[];
    timeline: {
        timestamp: Date;
        changes: string[];
        significance: number;
    }[];
}

interface EvasionAnalysis {
    detected: boolean;
    techniques: {
        name: string;
        confidence: number;
        description: string;
        evidence: Evidence[];
    }[];
    risk: number;  // 0-1 risk score
}

interface DetectionMetadata {
    timestamp: Date;
    processingTime: number;
    modelVersion: string;
    strategiesUsed: string[];
    dataPoints: number;
    limitations: string[];
}

export interface DetectionOptions {
    baselineComparison?: boolean;
    minConfidence?: number;
    includeDraft?: boolean;
    strategies?: string[];
    language?: string;
    context?: {
        assignment?: string;
        subject?: string;
        gradeLevel?: number;
    };
}

export interface DetectionStats {
    totalAnalyzed: number;
    detectedCount: number;
    averageConfidence: number;
    commonSignals: {
        type: DetectionSignalType;
        count: number;
        averageConfidence: number;
    }[];
    trends: {
        period: string;
        detectionRate: number;
        dominantSignals: string[];
    }[];
}

export interface BatchDetectionResult {
    results: Map<string, DetectionResult>;
    summary: {
        total: number;
        detected: number;
        suspicious: number;
        clean: number;
        averageConfidence: number;
    };
    patterns: {
        common: string[];
        unusual: string[];
        frequency: Record<string, number>;
    };
    recommendations: {
        priority: 'high' | 'medium' | 'low';
        action: string;
        impact: string;
        affected: string[];
    }[];
} 