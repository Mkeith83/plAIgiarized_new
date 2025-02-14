import { render, screen } from '@testing-library/react';
import { DetectionResults } from '../../analysis/DetectionResults';
import type { WritingMetrics, MetricsComparison } from '@/lib/interfaces/metrics';

describe('DetectionResults', () => {
  const mockMetrics: WritingMetrics = {
    // Add mock data...
  };

  const mockComparison: MetricsComparison = {
    // Add mock data...
  };

  it('displays risk level correctly', () => {
    render(
      <DetectionResults
        metrics={mockMetrics}
        comparison={mockComparison}
      />
    );
    
    expect(screen.getByText(/similarity with baseline/i)).toBeInTheDocument();
  });

  // Add more tests...
}); 