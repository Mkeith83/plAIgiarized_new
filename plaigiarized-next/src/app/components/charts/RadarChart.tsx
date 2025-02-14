'use client';

import React from 'react';
import { Box, useToken } from '@chakra-ui/react';
import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface SkillMetric {
  name: string;
  value: number;
  fullMark: number;
}

interface RadarChartProps {
  data: SkillMetric[];
  height?: number | string;
  showTooltip?: boolean;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  height = 300,
  showTooltip = true
}) => {
  const [blue500, blue200] = useToken('colors', ['blue.500', 'blue.200']);

  return (
    <Box width="100%" height={height}>
      <ResponsiveContainer>
        <RechartsRadar
          cx="50%"
          cy="50%"
          outerRadius="80%"
          data={data}
        >
          <PolarGrid stroke={blue200} />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fill: 'gray', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: 'gray', fontSize: 10 }}
          />
          {showTooltip && (
            <Tooltip
              formatter={(value: number) => [`${value}%`, 'Score']}
              labelFormatter={(label: string) => `Skill: ${label}`}
            />
          )}
          <Radar
            name="Skills"
            dataKey="value"
            stroke={blue500}
            fill={blue500}
            fillOpacity={0.6}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </Box>
  );
}; 