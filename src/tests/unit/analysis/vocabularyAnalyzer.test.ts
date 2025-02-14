import { VocabularyAnalyzer } from '@/lib/analysis/vocabularyAnalyzer';
import { mockEssayText, mockAcademicText } from '../../utils/mockData';
import type { VocabularyMetrics } from '@/lib/interfaces/metrics';

describe('VocabularyAnalyzer', () => {
  let analyzer: VocabularyAnalyzer;

  beforeEach(() => {
    analyzer = new VocabularyAnalyzer();
  });

  it('calculates vocabulary metrics correctly', async () => {
    const metrics = await analyzer.analyze(mockEssayText);
    
    expect(metrics).toMatchObject<Partial<VocabularyMetrics>>({
      uniqueWords: expect.any(Number),
      totalWords: expect.any(Number),
      complexity: expect.any(Number),
      academicWords: expect.any(Number),
    });
  });

  it('detects academic vocabulary', async () => {
    const metrics = await analyzer.analyze(mockAcademicText);
    expect(metrics.academicWords).toBeGreaterThan(0);
    expect(metrics.sophistication).toBeGreaterThan(0.5);
  });

  it('handles empty text', async () => {
    const metrics = await analyzer.analyze('');
    expect(metrics.totalWords).toBe(0);
    expect(metrics.complexity).toBe(0);
  });
}); 