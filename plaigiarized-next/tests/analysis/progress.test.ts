import { ProgressService } from '@/lib/services/progress';
import { Essay } from '@/lib/interfaces/database/models';
import { ProgressAnalyzer } from '@/lib/analysis/progressAnalyzer';

describe('ProgressService', () => {
  let service: ProgressService;

  beforeEach(() => {
    service = new ProgressService();
  });

  describe('trackProgress', () => {
    it('should track student progress', async () => {
      const studentId = 'test-student';
      const essay: Essay = {
        id: 'test-essay',
        studentId,
        content: 'Test content',
        createdAt: new Date(),
        isBaseline: false,
        metrics: {
          vocabulary: {
            uniqueWords: 100,
            complexWords: 20,
            averageWordLength: 5,
            wordFrequencies: {},
            commonWords: [],
            rareWords: []
          },
          style: {
            sentenceCount: 10,
            averageSentenceLength: 15,
            paragraphCount: 3,
            averageParagraphLength: 50,
            transitionWords: [],
            punctuationFrequency: {}
          },
          improvement: 0.5,
          consistency: 0.8
        }
      };

      await service.trackProgress(studentId, essay);
      const history = service.getProgressHistory(studentId);

      expect(history).toHaveLength(1);
      expect(history[0].essayId).toBe(essay.id);
    });
  });

  describe('calculateImprovement', () => {
    it('should calculate improvement metrics', () => {
      const studentId = 'test-student';
      const result = service.calculateImprovement(studentId);

      expect(result).toHaveProperty('overall');
      expect(result).toHaveProperty('vocabulary');
      expect(result).toHaveProperty('style');
    });

    it('should handle no history', () => {
      const result = service.calculateImprovement('nonexistent');
      expect(result.overall).toBe(0);
    });
  });
});

describe('ProgressAnalyzer', () => {
  let analyzer: ProgressAnalyzer;

  beforeEach(() => {
    analyzer = new ProgressAnalyzer();
  });

  describe('analyzeProgress', () => {
    it('should analyze student progress over time', async () => {
      const essays: Essay[] = [
        {
          id: 'essay-1',
          studentId: 'student-1',
          content: 'First essay content...',
          createdAt: new Date('2024-01-01'),
          metrics: {
            vocabulary: { score: 0.7 },
            style: { score: 0.6 }
          }
        },
        {
          id: 'essay-2',
          studentId: 'student-1',
          content: 'Second essay content...',
          createdAt: new Date('2024-01-15'),
          metrics: {
            vocabulary: { score: 0.8 },
            style: { score: 0.7 }
          }
        }
      ];

      const progress = await analyzer.analyzeProgress(essays);

      expect(progress.trend).toBeDefined();
      expect(progress.improvement).toBeGreaterThan(0);
      expect(progress.metrics).toBeDefined();
    });

    it('should handle single essay', async () => {
      const essays = [{
        id: 'essay-1',
        studentId: 'student-1',
        content: 'Essay content',
        createdAt: new Date(),
        metrics: {
          vocabulary: { score: 0.7 },
          style: { score: 0.6 }
        }
      }];

      const progress = await analyzer.analyzeProgress(essays);
      expect(progress.trend).toBe('steady');
    });
  });

  describe('calculateTrend', () => {
    it('should identify improving trend', () => {
      const scores = [0.5, 0.6, 0.7, 0.8];
      const trend = analyzer.calculateTrend(scores);
      expect(trend).toBe('improving');
    });

    it('should identify declining trend', () => {
      const scores = [0.8, 0.7, 0.6, 0.5];
      const trend = analyzer.calculateTrend(scores);
      expect(trend).toBe('declining');
    });
  });
}); 