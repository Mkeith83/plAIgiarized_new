import { StyleMetrics, WritingMetrics } from './metrics';

export interface StudentBaseline {
    studentId: string;
    documents: BaselineDocument[];
    metrics: BaselineMetrics;
    patterns: WritingPatterns;
    vocabulary: VocabularyProfile;
    firstDocument: Date;
    lastUpdated: Date;
    confidence: number;
}

interface BaselineDocument {
    documentId: string;
    metrics: WritingMetrics;
    timestamp: Date;
    weight: number;  // Recency weight for baseline calculations
}

interface BaselineMetrics {
    current: StyleMetrics;
    historical: StyleMetrics[];
    trend: {
        vocabulary: TrendMetrics;
        gradeLevel: TrendMetrics;
        style: TrendMetrics;
    };
}

interface TrendMetrics {
    direction: 'improving' | 'declining' | 'stable';
    rate: number;  // Rate of change
    confidence: number;
    periods: {
        start: Date;
        end: Date;
        value: number;
    }[];
}

interface WritingPatterns {
    sentence: {
        common: string[];
        frequency: Record<string, number>;
        complexity: number[];
    };
    paragraph: {
        structure: string[];
        transitions: string[];
        averageLength: number;
    };
    style: {
        formal: boolean;
        technical: boolean;
        descriptive: boolean;
        narrative: boolean;
    };
}

interface VocabularyProfile {
    common: Set<string>;      // Frequently used words
    academic: Set<string>;    // Academic vocabulary
    technical: Set<string>;   // Subject-specific terms
    unique: Set<string>;      // Distinctive vocabulary
    growth: {
        rate: number;
        newWords: string[];
        mastered: string[];
        timestamp: Date;
    };
}

export interface BaselineComparison {
    similarity: number;
    differences: {
        vocabulary: VocabularyDifference;
        style: StyleDifference;
        patterns: PatternDifference;
    };
    confidence: number;
    analysis: string;
}

interface VocabularyDifference {
    added: string[];
    removed: string[];
    changed: {
        word: string;
        from: string;
        to: string;
        significance: number;
    }[];
    overallChange: number;
}

interface StyleDifference {
    sentenceStructure: number;
    paragraphStructure: number;
    toneShift: number;
    formalityChange: number;
}

interface PatternDifference {
    new: string[];
    missing: string[];
    modified: {
        pattern: string;
        change: number;
        significance: number;
    }[];
}

export interface BaselineUpdate {
    documentId: string;
    metrics: WritingMetrics;
    patterns: WritingPatterns;
    vocabulary: {
        added: string[];
        frequency: Record<string, number>;
    };
    timestamp: Date;
} 