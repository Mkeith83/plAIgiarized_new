import type { Meta, StoryObj } from '@storybook/react';
import { DetectionResults } from './DetectionResults';

const meta: Meta<typeof DetectionResults> = {
  title: 'Components/Analysis/DetectionResults',
  component: DetectionResults,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DetectionResults>;

export const HighRisk: Story = {
  args: {
    metrics: {
      // Add mock data...
    },
    comparison: {
      similarity: 0.95,
      confidence: 0.9,
      // Add more mock data...
    },
  },
};

export const LowRisk: Story = {
  args: {
    ...HighRisk.args,
    comparison: {
      ...HighRisk.args.comparison,
      similarity: 0.3,
    },
  },
}; 