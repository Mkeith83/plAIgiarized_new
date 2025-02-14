import { ProgressReport } from '../analysis/progressInterface';

export interface EssaySummary {
  id: string;
  title: string;
  submittedAt: string;
  wordCount: number;
  gradeLevel: number;
  aiDetection: {
    score: number;
    confidence: number;
    status: 'human' | 'ai' | 'uncertain';
  };
  analysis: {
    readability: number;
    vocabulary: number;
    style: number;
  };
  feedback?: {
    teacher: string[];
    automated: string[];
  };
}

export interface StudentDashboard {
  studentId: string;
  classId: string;
  profile: {
    gradeLevel: number;
    joinedAt: string;
    lastActive: string;
  };
  progress: ProgressReport;
  recentEssays: EssaySummary[];
  stats: {
    totalSubmissions: number;
    averageWordCount: number;
    averageGradeLevel: number;
    improvement: {
      vocabulary: number;
      style: number;
      overall: number;
    };
  };
  feedback: Array<{
    id: string;
    essayId: string;
    type: 'teacher' | 'automated';
    content: string;
    timestamp: string;
    status: 'unread' | 'read' | 'implemented';
  }>;
}
