import { DetectionResult } from './detection';
import { StyleMetrics } from './metrics';

export interface Assignment {
    id: string;
    title: string;
    description: string;
    courseId: string;
    dueDate: Date;
    settings: AssignmentSettings;
    metadata: AssignmentMetadata;
    submissions: SubmissionRecord[];
    analytics: AssignmentAnalytics;
}

interface AssignmentSettings {
    allowedFileTypes: string[];
    maxFileSize: number;
    detectionThreshold: number;
    requireBaseline: boolean;
    autoGrade: boolean;
    compareToClass: boolean;
    notifyOnDetection: boolean;
    gradingCriteria: GradingCriteria[];
}

interface AssignmentMetadata {
    subject: string;
    gradeLevel: number;
    expectedLength: {
        min: number;
        max: number;
        unit: 'words' | 'pages';
    };
    topics: string[];
    resources: {
        url: string;
        type: string;
        required: boolean;
    }[];
}

interface SubmissionRecord {
    id: string;
    studentId: string;
    timestamp: Date;
    files: SubmissionFile[];
    detectionResults: DetectionResult;
    metrics: StyleMetrics;
    status: SubmissionStatus;
    feedback: Feedback[];
    history: SubmissionHistory[];
}

interface SubmissionFile {
    id: string;
    name: string;
    type: string;
    size: number;
    path: string;
    processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
    processingErrors?: string[];
}

type SubmissionStatus = 
    | 'draft'
    | 'submitted'
    | 'processing'
    | 'reviewed'
    | 'flagged'
    | 'resubmitted'
    | 'graded';

interface Feedback {
    type: 'auto' | 'manual';
    timestamp: Date;
    author: string;
    content: string;
    category: FeedbackCategory;
    location?: {
        start: number;
        end: number;
        context: string;
    };
}

type FeedbackCategory = 
    | 'style'
    | 'content'
    | 'grammar'
    | 'originality'
    | 'improvement'
    | 'general';

interface SubmissionHistory {
    version: number;
    timestamp: Date;
    changes: {
        type: 'content' | 'file' | 'status';
        description: string;
        from: any;
        to: any;
    }[];
}

interface GradingCriteria {
    name: string;
    weight: number;
    rubric: {
        score: number;
        description: string;
        requirements: string[];
    }[];
}

interface AssignmentAnalytics {
    submissions: {
        total: number;
        onTime: number;
        late: number;
        pending: number;
    };
    detections: {
        flagged: number;
        suspicious: number;
        clean: number;
        averageScore: number;
    };
    performance: {
        averageGrade: number;
        gradeDistribution: Record<string, number>;
        topPerformers: string[];
        needHelp: string[];
    };
    trends: {
        timestamp: Date;
        metrics: Record<string, number>;
        notes: string[];
    }[];
}

export interface AssignmentBatch {
    batchId: string;
    assignments: Assignment[];
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: {
        total: number;
        processed: number;
        failed: number;
    };
    results: {
        successful: string[];
        failed: Array<{
            id: string;
            error: string;
        }>;
    };
} 