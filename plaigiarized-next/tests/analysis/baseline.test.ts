import { BaselineAnalyzer } from '@/lib/analysis/baselineAnalyzer';
import { Essay } from '@/lib/interfaces/database/models';

describe('BaselineAnalyzer', () => {
  let analyzer: BaselineAnalyzer;

  beforeEach(() => {
    analyzer = new BaselineAnalyzer();
  });

  describe('createBaseline', () => {
    it('should create baseline profile from essays', async () => {
      const essays: Essay[] = [
        {
          id: 'essay-1',
          studentId: 'student-1',
          content: 'First essay content...',
          createdAt: new Date(),
          isBaseline: true
        },
        {
          id: 'essay-2',
          studentId: 'student-1',
          content: 'Second essay content...',
          createdAt: new Date(),
          isBaseline: true
        }
      ];

      const baseline = await analyzer.createBaseline(essays);

      expect(baseline.studentId).toBe('student-1');
      expect(baseline.samples).toHaveLength(2);
      expect(baseline.metrics).toBeDefined();
      expect(baseline.confidence).toBeGreaterThan(0);
    });

    it('should handle empty essay list', async () => {
      await expect(analyzer.createBaseline([])).rejects.toThrow();
    });
  });

  describe('metrics aggregation', () => {
    it('should aggregate vocabulary metrics', async () => {
      const essays: Essay[] = [/* test essays */];
      const baseline = await analyzer.createBaseline(essays);

      expect(baseline.metrics.vocabulary).toBeDefined();
      expect(baseline.metrics.vocabulary.uniqueWords).toBeGreaterThan(0);
    });

    it('should aggregate style metrics', async () => {
      const essays: Essay[] = [/* test essays */];
      const baseline = await analyzer.createBaseline(essays);

      expect(baseline.metrics.style).toBeDefined();
      expect(baseline.metrics.style.sentenceCount).toBeGreaterThan(0);
    });
  });
});
