'use client';

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer
} from 'recharts';
import { Box, Text } from '@chakra-ui/react';
import type { WritingMetrics } from '../../../lib/interfaces/analysis';

interface RadarProps {
  current: WritingMetrics;
  baseline: WritingMetrics;
}

export const MetricsRadar: React.FC<RadarProps> = ({ current, baseline }) => {
  const data = [
    {
      metric: 'Vocabulary',
      current: current.vocabulary.complexityScore,
      baseline: baseline.vocabulary.complexityScore
    },
    {
      metric: 'Style',
      current: current.style.consistencyScore,
      baseline: baseline.style.consistencyScore
    },
    {
      metric: 'Syntax',
      current: current.syntax.complexSentences,
      baseline: baseline.syntax.complexSentences
    }
  ];

  return (
    <Box h="300px" w="100%">
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" />
          <Radar
            name="Current"
            dataKey="current"
            stroke="#4299E1"
            fill="#4299E1"
            fillOpacity={0.5}
          />
          <Radar
            name="Baseline"
            dataKey="baseline"
            stroke="#48BB78"
            fill="#48BB78"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </Box>
  );
}; 