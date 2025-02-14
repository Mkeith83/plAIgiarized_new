'use client';

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Tooltip,
  useBreakpointValue,
  SimpleGrid
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { FiAlertTriangle, FiTrendingUp } from 'react-icons/fi';

import type { WritingMetrics, StyleChange } from '../../../lib/interfaces/analysis';

interface EvolutionPoint {
  date: string;
  metrics: WritingMetrics;
  changes: StyleChange[];
}

interface WritingStyleEvolutionProps {
  studentId: string;
  timeline: EvolutionPoint[];
  thresholds: {
    normal: number;
    suspicious: number;
  };
}

export const WritingStyleEvolution: React.FC<WritingStyleEvolutionProps> = ({
  studentId,
  timeline,
  thresholds
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  const getChangeColor = (change: number) => {
    if (Math.abs(change) > thresholds.suspicious) return 'red.500';
    if (Math.abs(change) > thresholds.normal) return 'yellow.500';
    return 'green.500';
  };

  const chartData = timeline.map((point, index) => {
    const previousPoint = index > 0 ? timeline[index - 1] : null;
    const vocabularyChange = previousPoint
      ? ((point.metrics.vocabulary.complexityScore - previousPoint.metrics.vocabulary.complexityScore) /
          previousPoint.metrics.vocabulary.complexityScore) *
        100
      : 0;

    return {
      date: new Date(point.date).toLocaleDateString(),
      vocabularyComplexity: point.metrics.vocabulary.complexityScore,
      syntaxComplexity: point.metrics.syntax.averageSentenceLength,
      styleConsistency: point.metrics.style.consistencyScore,
      change: vocabularyChange
    };
  });

  return (
    <Box bg="white" p={4} borderRadius="lg" shadow="md">
      <VStack spacing={6} align="stretch">
        <Text fontSize="lg" fontWeight="bold">
          Writing Style Evolution
        </Text>

        {/* Timeline Chart */}
        <Box h="200px">
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tick={{ fill: 'gray.600' }}
              />
              <YAxis hide />
              <ReferenceLine
                y={thresholds.suspicious}
                stroke="red"
                strokeDasharray="3 3"
              />
              <Line
                type="monotone"
                dataKey="vocabularyComplexity"
                stroke="#4299E1"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="styleConsistency"
                stroke="#48BB78"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Significant Changes */}
        <VStack spacing={3} align="stretch">
          {timeline.map((point, index) => {
            const significantChanges = point.changes.filter(
              c => c.severity === 'high'
            );

            if (significantChanges.length === 0) return null;

            return (
              <Box
                key={index}
                p={3}
                bg="gray.50"
                borderRadius="md"
                borderLeft="4px"
                borderLeftColor={getChangeColor(
                  significantChanges[0].currentValue - significantChanges[0].previousValue
                )}
              >
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="medium">
                    {new Date(point.date).toLocaleDateString()}
                  </Text>
                  <Badge
                    colorScheme={
                      significantChanges.length > 1 ? 'red' : 'yellow'
                    }
                  >
                    {significantChanges.length} changes
                  </Badge>
                </HStack>

                <VStack align="start" spacing={1}>
                  {significantChanges.map((change, changeIndex) => (
                    <HStack key={changeIndex} spacing={2}>
                      {change.confidence > 0.8 && (
                        <FiAlertTriangle color="red" />
                      )}
                      <Text fontSize="sm" color="gray.600">
                        {change.description}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            );
          })}
        </VStack>

        {/* Summary Metrics */}
        <SimpleGrid columns={2} spacing={4}>
          <Box p={3} bg="blue.50" borderRadius="md">
            <Text fontSize="sm" color="blue.700" fontWeight="medium">
              Overall Trend
            </Text>
            <Text fontSize="sm" color="blue.600" mt={1}>
              {timeline[timeline.length - 1].metrics.vocabulary.consistencyScore >
              timeline[0].metrics.vocabulary.consistencyScore
                ? 'Improving gradually'
                : 'Needs attention'}
            </Text>
          </Box>

          <Box p={3} bg="green.50" borderRadius="md">
            <Text fontSize="sm" color="green.700" fontWeight="medium">
              Style Consistency
            </Text>
            <Text fontSize="sm" color="green.600" mt={1}>
              {timeline[timeline.length - 1].metrics.style.consistencyScore}% match
            </Text>
          </Box>
        </SimpleGrid>
      </VStack>
    </Box>
  );
}; 