'use client';

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue
} from '@chakra-ui/react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import type { ClassMetrics, ImprovementMetrics } from '@/lib/interfaces/metrics';

interface ClassReportProps {
  classId: string;
  metrics: ClassMetrics;
  trends: {
    submissions: Array<{ date: string; count: number }>;
    improvements: Array<{ date: string; rate: number }>;
    participation: Array<{ date: string; active: number; total: number }>;
  };
}

export const ClassReport: React.FC<ClassReportProps> = ({
  classId,
  metrics,
  trends
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <VStack spacing={6} w="100%" align="stretch">
      {/* Overview Stats */}
      <Grid templateColumns="repeat(4, 1fr)" gap={4}>
        <GridItem>
          <Stat p={4} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
            <StatLabel>Average Grade Level</StatLabel>
            <StatNumber>{metrics.averageGradeLevel.toFixed(1)}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              {((metrics.improvementRate) * 100).toFixed(1)}%
            </StatHelpText>
          </Stat>
        </GridItem>
        {/* Add more stats... */}
      </Grid>

      {/* Submission Trends */}
      <Box p={4} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
        <Text fontSize="lg" fontWeight="medium" mb={4}>
          Submission Trends
        </Text>
        <Box h="300px">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends.submissions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#4299E1"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* Improvement Rates */}
      <Box p={4} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
        <Text fontSize="lg" fontWeight="medium" mb={4}>
          Class Improvement
        </Text>
        <Box h="300px">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends.improvements}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="rate"
                fill="#48BB78"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* Participation Rates */}
      <Box p={4} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
        <Text fontSize="lg" fontWeight="medium" mb={4}>
          Student Participation
        </Text>
        <Box h="300px">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends.participation}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="active"
                stroke="#4299E1"
                name="Active Students"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#A0AEC0"
                name="Total Students"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </VStack>
  );
}; 