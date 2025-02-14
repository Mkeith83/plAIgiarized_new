import type { ClassMetrics } from '../metrics';

export interface User {
  id: string;
  email: string;
  hashedPassword: string;
  fullName?: string;
  role: 'teacher' | 'admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Class {
  id: string;
  name: string;
  teacherId: string;
  createdAt: Date;
  updatedAt?: Date;
  avgImprovement?: number;
  classMetrics?: ClassMetrics;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  classId: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Essay {
  id: string;
  studentId: string;
  title?: string;
  content: string;
  createdAt: Date;
  isBaseline?: boolean;
  gradeLevel?: number;
  metrics?: {
    vocabulary: {
      score: number;
    };
    style: {
      score: number;
    };
  };
}

export interface AnalysisResult {
  aiScore: number;
  confidence: number;
  gradeLevel?: number;
  segments?: Array<{
    text: string;
    probability: number;
    start: number;
    end: number;
  }>;
  metrics: {
    vocabulary: {
      uniqueWords: number;
      complexWords: number;
      averageWordLength: number;
      wordFrequencies: Record<string, number>;
      commonWords: string[];
      rareWords: string[];
    };
    style: {
      sentenceCount: number;
      averageSentenceLength: number;
      paragraphCount: number;
      averageParagraphLength: number;
      transitionWords: string[];
      punctuationFrequency: Record<string, number>;
    };
  };
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  classes: string[];
  createdAt: string;
  updatedAt: string;
} 