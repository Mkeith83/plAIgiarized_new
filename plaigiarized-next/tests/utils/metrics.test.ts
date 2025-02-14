import { calculateMetrics } from '@/lib/utils/metrics';
import { VocabularyMetrics, StyleMetrics } from '@/lib/interfaces/metrics';

describe('Metrics Utils', () => {
  describe('calculateMetrics', () => {
    it('should calculate vocabulary metrics', () => {
      const text = 'This is a test sentence with some complex vocabulary words.';
      const metrics = calculateMetrics(text);

      expect(metrics.vocabulary).toBeDefined();
      expect(metrics.vocabulary.uniqueWords).toBeGreaterThan(0);
      expect(metrics.vocabulary.complexWords).toBeGreaterThanOrEqual(0);
    });

    it('should calculate style metrics', () => {
      const text = 'First sentence. Second sentence with more words. Third complex sentence.';
      const metrics = calculateMetrics(text);

      expect(metrics.style).toBeDefined();
      expect(metrics.style.sentenceCount).toBe(3);
      expect(metrics.style.averageSentenceLength).toBeGreaterThan(0);
    });

    it('should handle empty text', () => {
      const metrics = calculateMetrics('');

      expect(metrics.vocabulary.uniqueWords).toBe(0);
      expect(metrics.style.sentenceCount).toBe(0);
    });

    it('should detect transition words', () => {
      const text = 'However, this is a test. Therefore, we should see transitions.';
      const metrics = calculateMetrics(text);

      expect(metrics.style.transitionWords).toContain('however');
      expect(metrics.style.transitionWords).toContain('therefore');
    });
  });
}); 