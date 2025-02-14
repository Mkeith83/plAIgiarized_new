export interface User {
    id: string;
    type: UserType;
    status: UserStatus;
    profile: UserProfile;
    settings: UserSettings;
    permissions: UserPermissions;
    metadata: UserMetadata;
    analytics: UserAnalytics;
}

type UserType = 
    | 'student'
    | 'teacher'
    | 'admin'
    | 'researcher'
    | 'assistant';

type UserStatus = 
    | 'active'
    | 'inactive'
    | 'suspended'
    | 'pending'
    | 'archived';

interface UserProfile {
    email: string;
    name: {
        first: string;
        last: string;
        display?: string;
    };
    avatar?: string;
    institution: {
        id: string;
        name: string;
        department?: string;
        role?: string;
    };
    academic: {
        level?: string;
        year?: number;
        major?: string;
        advisors?: string[];
    };
    contact: {
        phone?: string;
        address?: string;
        timezone: string;
    };
}

interface UserSettings {
    notifications: {
        email: boolean;
        browser: boolean;
        frequency: 'immediate' | 'daily' | 'weekly';
        types: {
            [key: string]: boolean;
        };
    };
    privacy: {
        shareAnalytics: boolean;
        shareProfile: boolean;
        allowResearch: boolean;
    };
    display: {
        theme: 'light' | 'dark' | 'system';
        language: string;
        timezone: string;
    };
    analysis: {
        autoProcess: boolean;
        detectionThreshold: number;
        compareToBaseline: boolean;
        includeDrafts: boolean;
    };
}

interface UserPermissions {
    roles: string[];
    scopes: string[];
    restrictions: {
        type: string;
        reason: string;
        expires?: Date;
    }[];
    custom: {
        [key: string]: boolean | number | string;
    };
}

interface UserMetadata {
    created: Date;
    lastActive: Date;
    lastUpdate: Date;
    loginHistory: {
        timestamp: Date;
        ip: string;
        device: string;
    }[];
    verifications: {
        email: boolean;
        institution: boolean;
        academic: boolean;
    };
    integrations: {
        service: string;
        connected: boolean;
        lastSync: Date;
    }[];
}

interface UserAnalytics {
    activity: {
        submissions: number;
        reviews: number;
        detections: number;
        reports: number;
    };
    performance: {
        averageScore: number;
        detectionRate: number;
        responseTime: number;
    };
    usage: {
        lastPeriod: {
            start: Date;
            end: Date;
            metrics: Record<string, number>;
        };
        historical: {
            timestamp: Date;
            metrics: Record<string, number>;
        }[];
    };
    insights: {
        type: string;
        description: string;
        significance: number;
        timestamp: Date;
    }[];
}

export interface UserBatch {
    batchId: string;
    operation: 'create' | 'update' | 'delete' | 'import';
    users: User[];
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
    metadata: {
        source: string;
        timestamp: Date;
        operator: string;
    };
}

export interface UserQuery {
    type?: UserType[];
    status?: UserStatus[];
    institution?: string;
    department?: string;
    role?: string;
    permissions?: string[];
    active?: {
        from: Date;
        to: Date;
    };
    metrics?: {
        [key: string]: {
            min?: number;
            max?: number;
        };
    };
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
    pagination: {
        page: number;
        limit: number;
    };
} 