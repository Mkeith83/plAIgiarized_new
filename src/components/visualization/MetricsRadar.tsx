'use client';

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';
import type { WritingMetrics } from '@/lib/interfaces/metrics';

interface MetricsRadarProps {
  current: WritingMetrics;
  baseline?: WritingMetrics;
}

export const MetricsRadar: React.FC<MetricsRadarProps> = ({
  current,
  baseline
}) => {
  const data = [
    {
      metric: 'Vocabulary',
      current: current.vocabulary.complexity,
      baseline: baseline?.vocabulary.complexity || 0
    },
    {
      metric: 'Academic',
      current: current.style.tone.academic,
      baseline: baseline?.style.tone.academic || 0
    },
    {
      metric: 'Grade Level',
      current: current.gradeLevel.overall,
      baseline: baseline?.gradeLevel.overall || 0
    },
    {
      metric: 'Structure',
      current: current.style.sentenceStructure.complexity,
      baseline: baseline?.style.sentenceStructure.complexity || 0
    },
    {
      metric: 'Coherence',
      current: current.style.paragraphStructure.coherence,
      baseline: baseline?.style.paragraphStructure.coherence || 0
    }
  ];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="metric" />
        <PolarRadiusAxis angle={30} domain={[0, 1]} />
        <Radar
          name="Current"
          dataKey="current"
          stroke="#4299E1"
          fill="#4299E1"
          fillOpacity={0.5}
        />
        {baseline && (
          <Radar
            name="Baseline"
            dataKey="baseline"
            stroke="#A0AEC0"
            fill="#A0AEC0"
            fillOpacity={0.3}
          />
        )}
      </RadarChart>
    </ResponsiveContainer>
  );
}; 