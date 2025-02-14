import { AIIntegrationHub } from '@/lib/ai/integrationHub';
import { DocumentInput } from '@/lib/interfaces/ai/integrationInterface';

describe('AIIntegrationHub', () => {
  let hub: AIIntegrationHub;

  beforeEach(() => {
    hub = new AIIntegrationHub();
  });

  describe('processDocument', () => {
    it('should process document with default tasks', async () => {
      const document: DocumentInput = {
        text: 'Test document content',
        metadata: { type: 'essay' }
      };

      const result = await hub.processDocument(document);

      expect(result.documentId).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(Object.keys(result.results)).toContain('analyze');
    });

    it('should process document with specific tasks', async () => {
      const document: DocumentInput = {
        text: 'Test document content'
      };
      const tasks = ['summarize', 'classify'];

      const result = await hub.processDocument(document, tasks);

      expect(Object.keys(result.results)).toEqual(expect.arrayContaining(tasks));
    });

    it('should handle empty document', async () => {
      const document: DocumentInput = { text: '' };
      await expect(hub.processDocument(document)).rejects.toThrow();
    });
  });

  describe('cache management', () => {
    it('should cache task results', async () => {
      const document: DocumentInput = {
        text: 'Test document content'
      };

      const firstResult = await hub.processDocument(document);
      const secondResult = await hub.processDocument(document);

      expect(secondResult).toEqual(firstResult);
    });

    it('should clear cache by type', () => {
      hub.clearCache('analyze');
      expect(hub.getCacheSize()).toBe(0);
    });
  });
});
