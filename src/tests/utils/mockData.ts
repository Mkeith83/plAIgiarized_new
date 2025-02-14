import { readFileSync } from 'fs';
import { join } from 'path';
import type { WritingMetrics, StyleMetrics } from '@/lib/interfaces/metrics';

export const mockImageBuffer = readFileSync(
  join(__dirname, '../fixtures/test-image.jpg')
);

export const mockEssayText = readFileSync(
  join(__dirname, '../fixtures/sample-essay.txt'),
  'utf-8'
);

export const mockAcademicText = readFileSync(
  join(__dirname, '../fixtures/academic-paper.txt'),
  'utf-8'
);

export const mockSubmission = {
  id: 'test-123',
  content: mockEssayText,
  studentId: 'student-123',
  timestamp: new Date(),
};

export const mockMetrics: WritingMetrics = {
  vocabulary: {
    uniqueWords: 500,
    totalWords: 1000,
    complexity: 0.75,
    academicWords: 50,
    subjectSpecific: 30,
    diversity: 0.8,
    sophistication: 0.7
  },
  gradeLevel: {
    overall: 12,
    readability: 0.8,
    complexity: 0.75,
    vocabulary: 0.85,
    structure: 0.7
  },
  style: {
    sentenceStructure: {
      averageLength: 15,
      complexity: 0.7,
      variety: 0.8,
      patterns: ['compound', 'complex']
    },
    paragraphStructure: {
      averageLength: 120,
      coherence: 0.85,
      transitions: 0.75
    },
    writingPatterns: {
      common: ['therefore', 'however'],
      unique: ['nevertheless', 'consequently'],
      frequency: { 'therefore': 5, 'however': 3 }
    },
    tone: {
      formal: 0.8,
      technical: 0.7,
      academic: 0.75
    }
  },
  timestamp: new Date(),
  confidence: 0.9,
  documentId: 'doc-123'
}; 