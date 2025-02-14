'use client';

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  SimpleGrid,
  Collapse,
  useDisclosure,
  Divider
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiChevronDown, FiChevronUp, FiAlertTriangle } from 'react-icons/fi';

import type { WritingMetrics, StyleChange } from '../../../lib/interfaces/analysis';
import { analyzeWritingStyle } from '../../../lib/analysis/styleAnalyzer';
import { detectAnomalies } from '../../../lib/ai/detector';

interface Submission {
  id: string;
  title: string;
  date: string;
  content: string;
  metrics: WritingMetrics;
}

interface ComparisonProps {
  submissions: Submission[];
  baselineMetrics: WritingMetrics;
  thresholds: {
    normal: number;
    suspicious: number;
  };
  onFlagSubmission: (id: string, reason: string) => void;
}

export const SubmissionsComparison: React.FC<ComparisonProps> = ({
  submissions,
  baselineMetrics,
  thresholds,
  onFlagSubmission
}) => {
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const { isOpen, onToggle } = useDisclosure();

  const getMetricDifference = (current: number, baseline: number) => {
    const percentChange = ((current - baseline) / baseline) * 100;
    return {
      value: percentChange,
      isSignificant: Math.abs(percentChange) > thresholds.normal,
      isSuspicious: Math.abs(percentChange) > thresholds.suspicious
    };
  };

  const compareSubmissions = (submissions: Submission[]) => {
    return submissions.map(submission => {
      const vocabDiff = getMetricDifference(
        submission.metrics.vocabulary.complexityScore,
        baselineMetrics.vocabulary.complexityScore
      );

      const styleDiff = getMetricDifference(
        submission.metrics.style.consistencyScore,
        baselineMetrics.style.consistencyScore
      );

      return {
        ...submission,
        differences: {
          vocabulary: vocabDiff,
          style: styleDiff
        }
      };
    });
  };

  const comparedData = compareSubmissions(
    submissions.filter(s => selectedSubmissions.includes(s.id))
  );

  return (
    <Box bg="white" p={4} borderRadius="lg" shadow="md">
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold">
          Submission Comparison
        </Text>

        {/* Submission Selection */}
        <SimpleGrid columns={2} spacing={3}>
          {submissions.map(submission => (
            <Button
              key={submission.id}
              size="sm"
              variant={selectedSubmissions.includes(submission.id) ? "solid" : "outline"}
              colorScheme="blue"
              onClick={() => {
                setSelectedSubmissions(prev =>
                  prev.includes(submission.id)
                    ? prev.filter(id => id !== submission.id)
                    : [...prev, submission.id]
                );
              }}
            >
              {new Date(submission.date).toLocaleDateString()}
            </Button>
          ))}
        </SimpleGrid>

        {/* Comparison Results */}
        {selectedSubmissions.length > 0 && (
          <VStack spacing={3} align="stretch">
            {comparedData.map(submission => (
              <Box
                key={submission.id}
                p={3}
                bg="gray.50"
                borderRadius="md"
                borderLeft="4px"
                borderLeftColor={
                  submission.differences.vocabulary.isSuspicious ||
                  submission.differences.style.isSuspicious
                    ? "red.500"
                    : submission.differences.vocabulary.isSignificant ||
                      submission.differences.style.isSignificant
                    ? "yellow.500"
                    : "green.500"
                }
              >
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="medium">
                    {submission.title}
                  </Text>
                  <Badge
                    colorScheme={
                      submission.differences.vocabulary.isSuspicious
                        ? "red"
                        : "green"
                    }
                  >
                    {Math.abs(submission.differences.vocabulary.value).toFixed(1)}% change
                  </Badge>
                </HStack>

                <SimpleGrid columns={2} spacing={3} mb={2}>
                  <Box>
                    <Text fontSize="xs" color="gray.600">
                      Vocabulary Complexity
                    </Text>
                    <Text fontSize="sm">
                      {submission.metrics.vocabulary.complexityScore.toFixed(1)}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.600">
                      Style Consistency
                    </Text>
                    <Text fontSize="sm">
                      {submission.metrics.style.consistencyScore.toFixed(1)}%
                    </Text>
                  </Box>
                </SimpleGrid>

                {(submission.differences.vocabulary.isSuspicious ||
                  submission.differences.style.isSuspicious) && (
                  <Button
                    size="sm"
                    leftIcon={<FiAlertTriangle />}
                    colorScheme="red"
                    variant="ghost"
                    onClick={() =>
                      onFlagSubmission(
                        submission.id,
                        "Suspicious changes in writing patterns"
                      )
                    }
                  >
                    Flag for Review
                  </Button>
                )}
              </Box>
            ))}
          </VStack>
        )}

        {/* Detailed Analysis Toggle */}
        <Button
          rightIcon={isOpen ? <FiChevronUp /> : <FiChevronDown />}
          onClick={onToggle}
          variant="ghost"
          size="sm"
        >
          {isOpen ? "Hide" : "Show"} Detailed Analysis
        </Button>

        <Collapse in={isOpen}>
          <VStack spacing={3} align="stretch">
            <Divider />
            {comparedData.map(submission => (
              <Box key={submission.id} p={3} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Pattern Analysis
                </Text>
                <SimpleGrid columns={2} spacing={3}>
                  <Box>
                    <Text fontSize="xs" color="gray.600">
                      Common Patterns
                    </Text>
                    <Text fontSize="sm">
                      {submission.metrics.syntax.commonStructures.length} matches
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.600">
                      New Patterns
                    </Text>
                    <Text fontSize="sm">
                      {submission.metrics.vocabulary.unusualWords.length} detected
                    </Text>
                  </Box>
                </SimpleGrid>
              </Box>
            ))}
          </VStack>
        </Collapse>
      </VStack>
    </Box>
  );
}; 