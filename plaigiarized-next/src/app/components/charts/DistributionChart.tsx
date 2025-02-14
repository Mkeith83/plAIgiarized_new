'use client';

import React from 'react';
import { Box, useToken } from '@chakra-ui/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface Range {
  min: number;
  max: number;
  count: number;
  label?: string;
}

interface DistributionChartProps {
  data: Range[];
  height?: number | string;
  showGrid?: boolean;
  average?: number;
  median?: number;
  colorScheme?: 'blue' | 'green' | 'purple';
}

export const DistributionChart: React.FC<DistributionChartProps> = ({
  data,
  height = 300,
  showGrid = true,
  average,
  median,
  colorScheme = 'blue'
}) => {
  const [primary500, primary200, gray300] = useToken('colors', [
    `${colorScheme}.500`,
    `${colorScheme}.200`,
    'gray.300'
  ]);

  const formattedData = data.map(range => ({
    ...range,
    label: range.label || `${range.min.toFixed(1)}-${range.max.toFixed(1)}`,
    percentage: (range.count / data.reduce((sum, r) => sum + r.count, 0)) * 100
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          bg="white"
          p={2}
          borderRadius="md"
          boxShadow="md"
          border="1px solid"
          borderColor="gray.200"
        >
          <Box fontWeight="medium">{label}</Box>
          <Box>Count: {data.count}</Box>
          <Box>Percentage: {data.percentage.toFixed(1)}%</Box>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box width="100%" height={height}>
      <ResponsiveContainer>
        <BarChart
          data={formattedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gray300} />}
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12 }}
            interval={0}
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            tickFormatter={(value) => `${value}`}
            label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(value) => `${value}%`}
            label={{ value: 'Percentage', angle: 90, position: 'insideRight' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="count"
            yAxisId="left"
            fill={primary500}
            fillOpacity={0.8}
            stroke={primary500}
            strokeWidth={1}
          >
            {formattedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={primary500}
                fillOpacity={0.8}
                stroke={primary500}
                strokeWidth={1}
              />
            ))}
          </Bar>
          {average !== undefined && (
            <ReferenceLine
              yAxisId="left"
              x={average}
              stroke={primary500}
              strokeDasharray="3 3"
              label={{
                value: 'Average',
                position: 'top',
                fill: primary500
              }}
            />
          )}
          {median !== undefined && (
            <ReferenceLine
              yAxisId="left"
              x={median}
              stroke={primary200}
              strokeDasharray="3 3"
              label={{
                value: 'Median',
                position: 'top',
                fill: primary200
              }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}; 