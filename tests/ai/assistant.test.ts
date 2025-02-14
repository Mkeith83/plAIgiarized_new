import { AIAssistant } from '@/lib/ai/assistant';
import { Message } from '@/lib/interfaces/ai/assistantInterface';

describe('AIAssistant', () => {
  let assistant: AIAssistant;

  beforeEach(() => {
    assistant = new AIAssistant();
  });

  describe('processMessage', () => {
    it('should process user message and return response', async () => {
      const message: Message = {
        role: 'user',
        content: 'Help me improve this essay.',
        context: {
          essayId: 'test-essay',
          previousFeedback: []
        }
      };

      const response = await assistant.processMessage(message);

      expect(response.role).toBe('assistant');
      expect(response.content).toBeDefined();
      expect(response.suggestions).toBeDefined();
    });

    it('should maintain conversation context', async () => {
      const firstMessage: Message = {
        role: 'user',
        content: 'What can I improve?',
        context: { essayId: 'test-essay' }
      };

      const secondMessage: Message = {
        role: 'user',
        content: 'Can you explain more?',
        context: { essayId: 'test-essay' }
      };

      await assistant.processMessage(firstMessage);
      const response = await assistant.processMessage(secondMessage);

      expect(response.context).toBeDefined();
      expect(response.context?.previousMessages).toHaveLength(2);
    });
  });

  describe('generateSuggestions', () => {
    it('should generate relevant suggestions', async () => {
      const suggestions = await assistant.generateSuggestions('test-essay');

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('type');
        expect(suggestion).toHaveProperty('content');
      });
    });
  });
}); 