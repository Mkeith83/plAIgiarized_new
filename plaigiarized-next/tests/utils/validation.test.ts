import { validateEssay, validateUser, validateMetrics } from '@/lib/utils/validation';
import { Essay, User } from '@/lib/interfaces/database/models';
import { VocabularyMetrics, StyleMetrics } from '@/lib/interfaces/metrics';

describe('Validation Utils', () => {
  describe('validateEssay', () => {
    it('should validate valid essay', () => {
      const essay: Essay = {
        id: 'test-id',
        studentId: 'student-1',
        content: 'Valid essay content',
        createdAt: new Date(),
        isBaseline: false
      };

      expect(() => validateEssay(essay)).not.toThrow();
    });

    it('should reject invalid essay', () => {
      const invalidEssay = {
        id: 'test-id',
        content: '' // Empty content
      };

      expect(() => validateEssay(invalidEssay as Essay)).toThrow();
    });
  });

  describe('validateUser', () => {
    it('should validate valid user', () => {
      const user: User = {
        id: 'user-1',
        email: 'test@example.com',
        hashedPassword: 'hash',
        role: 'teacher',
        isActive: true,
        createdAt: new Date()
      };

      expect(() => validateUser(user)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const invalidUser: User = {
        id: 'user-1',
        email: 'invalid-email',
        hashedPassword: 'hash',
        role: 'teacher',
        isActive: true,
        createdAt: new Date()
      };

      expect(() => validateUser(invalidUser)).toThrow();
    });
  });

  describe('validateMetrics', () => {
    it('should validate valid metrics', () => {
      const metrics = {
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
        }
      };

      expect(() => validateMetrics(metrics)).not.toThrow();
    });

    it('should reject negative values', () => {
      const invalidMetrics = {
        vocabulary: {
          uniqueWords: -1,
          complexWords: 20
        }
      };

      expect(() => validateMetrics(invalidMetrics)).toThrow();
    });
  });
}); 