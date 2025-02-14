import { AIDetector } from '@/lib/ai/detector';
import { DetectionResult } from '@/lib/interfaces/ai/detectionInterface';

describe('AIDetector', () => {
  let detector: AIDetector;

  beforeEach(() => {
    detector = new AIDetector({
      threshold: 0.8,
      minLength: 50,
      maxSegments: 10,
      models: [{
        name: 'test-model',
        version: '1.0',
        type: 'transformer',
        config: {}
      }]
    });
  });

  describe('detectAIContent', () => {
    it('should detect AI-generated content', async () => {
      const text = 'This is a test text that might be AI generated...';
      const result = await detector.detectAIContent(text);

      expect(result).toBeDefined();
      expect(result.isAIGenerated).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.segments.length).toBeGreaterThan(0);
    });

    it('should handle empty text', async () => {
      await expect(detector.detectAIContent('')).rejects.toThrow();
    });

    it('should handle text below minimum length', async () => {
      const shortText = 'Too short';
      const result = await detector.detectAIContent(shortText);
      expect(result.segments.length).toBe(0);
    });
  });

  describe('analyzeEssay', () => {
    it('should analyze essay content and metrics', async () => {
      const essay = {
        id: 'test-essay',
        studentId: 'test-student',
        content: 'This is a test essay content...',
        createdAt: new Date(),
        isBaseline: false
      };

      const result = await detector.analyzeEssay(essay);

      expect(result.metrics).toBeDefined();
      expect(result.metrics.vocabulary).toBeDefined();
      expect(result.metrics.style).toBeDefined();
    });
  });

  describe('analyzeAgainstBaseline', () => {
    it('should compare essay against baseline characteristics', async () => {
      const newEssay = {
        id: 'test-essay',
        studentId: 'test-student',
        content: 'New essay content...',
        createdAt: new Date(),
        isBaseline: false
      };

      const baselineEssays = [{
        id: 'baseline-1',
        studentId: 'test-student',
        content: 'Baseline essay content...',
        createdAt: new Date(),
        isBaseline: true
      }];

      const result = await detector.analyzeAgainstBaseline(newEssay, baselineEssays);

      expect(result.baselineComparison).toBeDefined();
      expect(result.baselineComparison.styleDivergence).toBeDefined();
      expect(result.baselineComparison.vocabularyShift).toBeDefined();
    });
  });
});
