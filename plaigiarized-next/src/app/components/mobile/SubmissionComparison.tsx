'use client';

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  SimpleGrid,
  Progress,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useBreakpointValue
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { BaselineComparison } from './BaselineComparison';
import { WritingPatternAnalysis } from './WritingPatternAnalysis';
import { WritingStyleTimeline } from './WritingStyleTimeline';

interface SubmissionComparisonProps {
  studentId: string;
  currentSubmission: {
    id: string;
    content: string;
    date: string;
    metrics: {
      vocabulary: any; // Using existing types from our analysis
      syntax: any;
      style: any;
    };
  };
  baselineData: {
    submissions: any[];
    patterns: any;
    metrics: any;
  };
  thresholds: {
    normal: number;
    suspicious: number;
  };
}

export const SubmissionComparison: React.FC<SubmissionComparisonProps> = ({
  studentId,
  currentSubmission,
  baselineData,
  thresholds
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Integrate with existing analysis components
  const analysisData = {
    patterns: {
      common: baselineData.patterns.filter((p: any) => p.isTypical),
      new: baselineData.patterns.filter((p: any) => !p.isTypical),
      missing: baselineData.patterns.filter((p: any) => p.isMissing)
    },
    snapshots: baselineData.submissions.map((sub: any) => ({
      date: sub.date,
      complexity: sub.metrics.complexity,
      consistencyScore: sub.metrics.consistencyScore,
      majorChanges: sub.metrics.significantChanges,
      vocabularyLevel: sub.metrics.vocabulary.level,
      structureScore: sub.metrics.syntax.score
    }))
  };

  return (
    <Box bg="white" borderRadius="lg" shadow="md" overflow="hidden">
      <Tabs isFitted variant="enclosed">
        <TabList>
          <Tab>Baseline</Tab>
          <Tab>Patterns</Tab>
          <Tab>Timeline</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <BaselineComparison
              studentName={studentId}
              comparison={{
                submissionId: currentSubmission.id,
                date: currentSubmission.date,
                baseline: baselineData.metrics,
                current: currentSubmission.metrics,
                significantChanges: [], // Map from existing metrics
                newPatterns: [], // Map from existing patterns
                consistentPatterns: [] // Map from existing patterns
              }}
              historicalTrend={baselineData.submissions.map((sub: any) => ({
                date: sub.date,
                styleMatch: sub.metrics.consistencyScore
              }))}
            />
          </TabPanel>

          <TabPanel>
            <WritingPatternAnalysis
              studentId={studentId}
              patterns={analysisData.patterns}
              timespan={{
                start: baselineData.submissions[0]?.date,
                end: currentSubmission.date
              }}
            />
          </TabPanel>

          <TabPanel>
            <WritingStyleTimeline
              studentId={studentId}
              snapshots={analysisData.snapshots}
              threshold={thresholds}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Summary Footer */}
      <Box p={4} bg="gray.50" borderTop="1px" borderColor="gray.200">
        <SimpleGrid columns={2} spacing={4}>
          <VStack align="start">
            <Text fontSize="sm" color="gray.600">Overall Match</Text>
            <Progress
              value={currentSubmission.metrics.consistencyScore}
              colorScheme={currentSubmission.metrics.consistencyScore > 80 ? 'green' : 'yellow'}
              width="100%"
            />
          </VStack>
          <VStack align="start">
            <Text fontSize="sm" color="gray.600">Risk Level</Text>
            <Badge
              colorScheme={
                currentSubmission.metrics.riskScore > thresholds.suspicious
                  ? 'red'
                  : currentSubmission.metrics.riskScore > thresholds.normal
                  ? 'yellow'
                  : 'green'
              }
            >
              {currentSubmission.metrics.riskScore > thresholds.suspicious
                ? 'High'
                : currentSubmission.metrics.riskScore > thresholds.normal
                ? 'Medium'
                : 'Low'}
            </Badge>
          </VStack>
        </SimpleGrid>
      </Box>
    </Box>
  );
}; 