import { DetectionWorkflow } from '@/lib/workflows/detection';
import { DocumentNormalizer } from '@/lib/services/documentNormalizer';
import { VocabularyAnalyzer } from '@/lib/analysis/vocabularyAnalyzer';
import { StealthDetector } from '@/lib/analysis/stealthDetector';
import { mockSubmission } from '../../utils/mockData';

describe('Detection Workflow', () => {
  let workflow: DetectionWorkflow;
  let normalizer: DocumentNormalizer;
  let analyzer: VocabularyAnalyzer;
  let detector: StealthDetector;

  beforeEach(() => {
    normalizer = new DocumentNormalizer();
    analyzer = new VocabularyAnalyzer();
    detector = new StealthDetector();
    workflow = new DetectionWorkflow(normalizer, analyzer, detector);
  });

  it('processes submission end-to-end', async () => {
    const result = await workflow.process(mockSubmission);
    
    expect(result).toMatchObject({
      metrics: expect.any(Object),
      detectionResults: expect.any(Object),
      confidence: expect.any(Number),
    });
  });

  it('handles processing errors gracefully', async () => {
    jest.spyOn(normalizer, 'normalize').mockRejectedValue(new Error('Processing failed'));
    
    await expect(workflow.process(mockSubmission))
      .rejects.toThrow('Processing failed');
  });
}); 