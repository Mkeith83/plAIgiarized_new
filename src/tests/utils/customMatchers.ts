import { expect } from '@jest/globals';

expect.extend({
  toBeValidMetrics(received) {
    const isValid = received &&
      typeof received.vocabulary === 'object' &&
      typeof received.gradeLevel === 'object' &&
      typeof received.style === 'object';

    return {
      message: () => `expected ${received} to be valid metrics`,
      pass: isValid
    };
  },

  toHaveImprovement(received, threshold = 0) {
    const hasImprovement = received.improvement &&
      received.improvement.overall > threshold;

    return {
      message: () => `expected ${received} to show improvement`,
      pass: hasImprovement
    };
  }
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidMetrics(): R;
      toHaveImprovement(threshold?: number): R;
    }
  }
} 