export interface TeacherDashboardData {
  recentSubmissions: Essay[];
  studentProgress: Record<string, {
    improvement: number;
    lastSubmission: string;
    status: 'improving' | 'steady' | 'declining';
  }>;
  classMetrics: {
    averageImprovement: number;
    submissionRate: number;
    activeStudents: number;
  };
  alerts: Array<{
    type: 'warning' | 'info' | 'success';
    message: string;
    studentId?: string;
  }>;
}

export interface StudentDashboardData {
  recentEssays: Essay[];
  progress: {
    overall: number;
    vocabulary: number;
    style: number;
    trend: 'improving' | 'steady' | 'declining';
  };
  metrics: {
    totalSubmissions: number;
    averageScore: number;
    strengths: string[];
    areasForImprovement: string[];
  };
  recommendations: Array<{
    type: 'practice' | 'review' | 'challenge';
    message: string;
    priority: number;
  }>;
} 