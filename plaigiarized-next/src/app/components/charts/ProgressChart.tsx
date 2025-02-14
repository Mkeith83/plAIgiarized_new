'use client';

import React from 'react';
import { Box, useToken } from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface DataPoint {
  timestamp: string;
  value: number;
  metadata?: Record<string, unknown>;
}

interface ProgressChartProps {
  data: DataPoint[];
  height?: number | string;
  showLegend?: boolean;
  showGrid?: boolean;
  customTooltip?: React.FC<any>;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  height = 300,
  showLegend = true,
  showGrid = true,
  customTooltip
}) => {
  const [blue500] = useToken('colors', ['blue.500']);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const formatValue = (value: number) => {
    return value.toFixed(1);
  };

  return (
    <Box width="100%" height={height}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatDate}
            minTickGap={30}
          />
          <YAxis tickFormatter={formatValue} />
          <Tooltip
            content={customTooltip}
            formatter={formatValue}
            labelFormatter={formatDate}
          />
          {showLegend && <Legend />}
          <Line
            type="monotone"
            dataKey="value"
            stroke={blue500}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Progress"
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}; 