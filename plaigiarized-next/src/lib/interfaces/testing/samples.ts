export interface SampleEssay {
  id: string;
  content: string;
  source: 'human' | 'ai' | 'mixed';
  metadata: {
    grade: number;
    verified: boolean;
    aiModel?: string;  // for AI essays
    editLevel?: string; // for mixed essays
  };
}

export interface DetectionFeedback {
  essayId: string;
  actualSource: 'human' | 'ai' | 'mixed';
  confidence: number;
  teacherVerified: boolean;
}

export interface SampleSet {
  id: string;
  name: string;
  description: string;
  essays: SampleEssay[];
  metadata: {
    totalCount: number;
    humanCount: number;
    aiCount: number;
    mixedCount: number;
    averageGrade: number;
    verificationRate: number;
  };
}

export interface VerificationResult {
  sampleId: string;
  predictions: Array<{
    source: 'human' | 'ai' | 'mixed';
    confidence: number;
  }>;
  accuracy: number;
  feedback?: DetectionFeedback;
} 