import { StyleAnalyzer } from '@/lib/analysis/styleAnalyzer';

describe('StyleAnalyzer', () => {
  let analyzer: StyleAnalyzer;

  beforeEach(() => {
    analyzer = new StyleAnalyzer();
  });

  describe('analyzeStyle', () => {
    it('should analyze text style metrics', async () => {
      const text = 'This is a test sentence. This is another sentence with more complexity.';
      const result = await analyzer.analyzeStyle(text);

      expect(result.sentenceCount).toBe(2);
      expect(result.averageSentenceLength).toBeGreaterThan(0);
      expect(result.transitionWords).toBeDefined();
      expect(result.punctuationFrequency).toBeDefined();
    });

    it('should handle empty text', async () => {
      const result = await analyzer.analyzeStyle('');
      expect(result.sentenceCount).toBe(0);
    });
  });

  describe('calculateReadabilityScore', () => {
    it('should calculate readability score', () => {
      const text = 'This is a simple test sentence. This is a more complex sentence with longer words.';
      const score = analyzer.calculateReadabilityScore(text);

      expect(score).toBeDefined();
      expect(typeof score).toBe('number');
    });
  });

  describe('analyzeTimeSeries', () => {
    it('should analyze time series data', () => {
      const data = [1, 2, 3, 4, 5];
      const result = analyzer.analyzeTimeSeries(data);

      expect(result.mean).toBeDefined();
      expect(result.standardDeviation).toBeDefined();
      expect(result.trend).toBeDefined();
    });

    it('should handle insufficient data points', () => {
      const data = [1, 2];
      expect(() => analyzer.analyzeTimeSeries(data)).toThrow();
    });
  });
});
