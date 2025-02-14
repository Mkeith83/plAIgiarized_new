'use client';

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Grid,
  GridItem,
  Badge,
  Progress,
  Button,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { FiDownload, FiTrendingUp } from 'react-icons/fi';
import { MetricsRadar } from '../visualization/MetricsRadar';
import { TrendIndicator } from '../visualization/TrendIndicator';
import type { WritingMetrics, ImprovementMetrics } from '@/lib/interfaces/metrics';

interface StudentReportProps {
  studentId: string;
  currentMetrics: WritingMetrics;
  historicalMetrics: WritingMetrics[];
  improvement: ImprovementMetrics;
  academicSources: Array<{
    title: string;
    similarity: number;
    date: string;
  }>;
}

export const StudentReport: React.FC<StudentReportProps> = ({
  studentId,
  currentMetrics,
  historicalMetrics,
  improvement,
  academicSources
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const trendData = historicalMetrics.map(metric => ({
    date: metric.timestamp.toLocaleDateString(),
    vocabulary: metric.vocabulary.complexity,
    gradeLevel: metric.gradeLevel.overall,
    academic: metric.style.tone.academic
  }));

  return (
    <VStack spacing={6} w="100%" align="stretch">
      {/* Overview */}
      <Box p={6} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
        <HStack justify="space-between" mb={4}>
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="bold">
              Writing Progress Report
            </Text>
            <Text color="gray.600">
              Overall Improvement: {(improvement.overall * 100).toFixed(1)}%
            </Text>
          </VStack>
          <Button
            leftIcon={<FiDownload />}
            colorScheme="blue"
            variant="outline"
            onClick={() => {/* Implement export */}}
          >
            Export Report
          </Button>
        </HStack>

        <Grid templateColumns="repeat(3, 1fr)" gap={4}>
          <GridItem>
            <VStack align="start" p={4} bg="gray.50" borderRadius="md">
              <Text color="gray.600">Vocabulary Progress</Text>
              <Text fontSize="2xl" fontWeight="bold">
                {(improvement.vocabulary * 100).toFixed(1)}%
              </Text>
              <Badge
                colorScheme={improvement.trend === 'improving' ? 'green' : 'red'}
              >
                {improvement.trend}
              </Badge>
            </VStack>
          </GridItem>
          {/* Add more metrics... */}
        </Grid>
      </Box>

      {/* Detailed Analysis */}
      <Tabs isLazy>
        <TabList>
          <Tab>Progress Trends</Tab>
          <Tab>Writing Style</Tab>
          <Tab>Academic Sources</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Box p={4} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
              <Text fontSize="lg" fontWeight="medium" mb={4}>
                Writing Metrics Over Time
              </Text>
              <Box h="400px">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="vocabulary"
                      stackId="1"
                      stroke="#4299E1"
                      fill="#4299E1"
                      fillOpacity={0.2}
                    />
                    <Area
                      type="monotone"
                      dataKey="gradeLevel"
                      stackId="2"
                      stroke="#48BB78"
                      fill="#48BB78"
                      fillOpacity={0.2}
                    />
                    <Area
                      type="monotone"
                      dataKey="academic"
                      stackId="3"
                      stroke="#ED8936"
                      fill="#ED8936"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel>
            <Box p={4} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
              <HStack spacing={8} align="start">
                <Box flex={1}>
                  <MetricsRadar
                    current={currentMetrics}
                    baseline={historicalMetrics[0]}
                  />
                </Box>
                <VStack flex={1} spacing={4} align="stretch">
                  <TrendIndicator
                    current={currentMetrics.vocabulary.complexity}
                    previous={historicalMetrics[0]?.vocabulary.complexity || 0}
                    threshold={0.2}
                    label="Vocabulary Complexity"
                  />
                  <TrendIndicator
                    current={currentMetrics.style.tone.academic}
                    previous={historicalMetrics[0]?.style.tone.academic || 0}
                    threshold={0.2}
                    label="Academic Tone"
                  />
                  <TrendIndicator
                    current={currentMetrics.gradeLevel.overall}
                    previous={historicalMetrics[0]?.gradeLevel.overall || 0}
                    threshold={0.2}
                    label="Grade Level"
                  />
                </VStack>
              </HStack>
            </Box>
          </TabPanel>

          <TabPanel>
            <Box p={4} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
              <Text fontSize="lg" fontWeight="medium" mb={4}>
                Academic Source Usage
              </Text>
              <VStack spacing={4} align="stretch">
                {academicSources.map(source => (
                  <Box
                    key={source.title}
                    p={4}
                    borderWidth={1}
                    borderRadius="md"
                    borderColor={borderColor}
                  >
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">{source.title}</Text>
                        <Text fontSize="sm" color="gray.600">
                          Used on {source.date}
                        </Text>
                      </VStack>
                      <Badge
                        colorScheme={source.similarity > 0.7 ? 'red' : 'green'}
                        fontSize="sm"
                      >
                        {(source.similarity * 100).toFixed(1)}% similarity
                      </Badge>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};
