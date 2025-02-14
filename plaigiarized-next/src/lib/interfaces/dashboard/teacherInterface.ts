export interface ClassSummary {
  id: string;
  name: string;
  studentCount: number;
  averageImprovement: number;
  recentSubmissions: number;
  flaggedEssays: number;
  participationRate: number;
  metrics: {
    averageGradeLevel: number;
    aiDetectionRate: number;
    participationRate: number;
  };
}

export interface TeacherDashboard {
  teacherId: string;
  classes: ClassSummary[];
  recentActivity: Array<{
    type: 'submission' | 'analysis' | 'feedback';
    timestamp: string;
    studentId: string;
    classId: string;
    essayId: string;
    details: Record<string, unknown>;
  }>;
  analytics: {
    totalStudents: number;
    totalEssays: number;
    averageImprovement: number;
    aiDetectionStats: {
      human: number;
      ai: number;
      uncertain: number;
    };
  };
  alerts: Array<{
    id: string;
    type: 'warning' | 'info' | 'critical';
    message: string;
    timestamp: string;
    context: Record<string, unknown>;
  }>;
}
