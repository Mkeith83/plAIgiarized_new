'use client';

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Badge,
  SimpleGrid,
  Tooltip,
  Button,
  useDisclosure
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiTrendingUp } from 'react-icons/fi';

interface WritingMetrics {
  vocabulary: {
    commonWords: string[];
    complexityScore: number;
    unusualWords: string[];
    transitionPhrases: string[];
  };
  syntax: {
    averageSentenceLength: number;
    complexSentences: number;
    commonStructures: string[];
  };
  style: {
    punctuationPatterns: string[];
    paragraphStructure: string;
    toneMarkers: string[];
  };
}

interface BaselineComparisonProps {
  studentName: string;
  previousSubmissions: {
    date: string;
    metrics: WritingMetrics;
  }[];
  currentSubmission: {
    date: string;
    metrics: WritingMetrics;
  };
}

export const BaselineComparison: React.FC<BaselineComparisonProps> = ({
  studentName,
  previousSubmissions,
  currentSubmission
}) => {
  const { isOpen, onToggle } = useDisclosure();

  // Calculate deviation from baseline
  const getDeviation = (baseline: number, current: number) => {
    const percentChange = ((current - baseline) / baseline) * 100;
    return {
      value: percentChange,
      isSignificant: Math.abs(percentChange) > 15, // Flag if more than 15% change
      isSuspicious: Math.abs(percentChange) > 25  // Flag if more than 25% change
    };
  };

  // Get average metrics from previous submissions for baseline
  const baselineMetrics = previousSubmissions.reduce((acc, submission) => ({
    vocabulary: {
      complexityScore: acc.vocabulary.complexityScore + submission.metrics.vocabulary.complexityScore,
      // ... other calculations
    },
    syntax: {
      averageSentenceLength: acc.syntax.averageSentenceLength + submission.metrics.syntax.averageSentenceLength,
      complexSentences: acc.syntax.complexSentences + submission.metrics.syntax.complexSentences,
    },
    // ... normalize by length
  }));

  const deviations = {
    vocabulary: getDeviation(
      baselineMetrics.vocabulary.complexityScore,
      currentSubmission.metrics.vocabulary.complexityScore
    ),
    syntax: getDeviation(
      baselineMetrics.syntax.averageSentenceLength,
      currentSubmission.metrics.syntax.averageSentenceLength
    ),
    // ... other comparisons
  };

  return (
    <Box bg="white" p={4} borderRadius="lg" shadow="md">
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="bold">
            Writing Pattern Analysis
          </Text>
          {(deviations.vocabulary.isSuspicious || deviations.syntax.isSuspicious) && (
            <Badge colorScheme="red">Unusual Changes Detected</Badge>
          )}
        </HStack>

        {/* Vocabulary Changes */}
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            Vocabulary Pattern Changes
          </Text>
          <VStack align="start" spacing={2}>
            <HStack width="100%" justify="space-between">
              <Text fontSize="sm">Common Words Match:</Text>
              <Badge 
                colorScheme={deviations.vocabulary.isSignificant ? 'red' : 'green'}
              >
                {Math.abs(deviations.vocabulary.value).toFixed(1)}% change
              </Badge>
            </HStack>
            {deviations.vocabulary.isSuspicious && (
              <Text fontSize="xs" color="red.500">
                • Unusual increase in vocabulary complexity
              </Text>
            )}
            {currentSubmission.metrics.vocabulary.unusualWords.length > 0 && (
              <Text fontSize="xs" color="gray.600">
                • New vocabulary patterns detected: {
                  currentSubmission.metrics.vocabulary.unusualWords.slice(0, 3).join(', ')
                }
              </Text>
            )}
          </VStack>
        </Box>

        {/* Writing Style Consistency */}
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            Writing Style Consistency
          </Text>
          <SimpleGrid columns={2} spacing={3}>
            <Box p={2} bg="gray.50" borderRadius="md">
              <Text fontSize="xs" color="gray.600">Sentence Structure</Text>
              <Progress 
                value={100 - Math.abs(deviations.syntax.value)}
                colorScheme={deviations.syntax.isSignificant ? 'red' : 'green'}
                size="sm"
              />
            </Box>
            <Box p={2} bg="gray.50" borderRadius="md">
              <Text fontSize="xs" color="gray.600">Typical Patterns</Text>
              <Progress 
                value={75} // Calculate based on common patterns match
                colorScheme="blue"
                size="sm"
              />
            </Box>
          </SimpleGrid>
        </Box>

        {/* Key Findings */}
        <Box p={3} bg={deviations.vocabulary.isSuspicious ? 'red.50' : 'blue.50'} borderRadius="md">
          <Text fontSize="sm" fontWeight="medium">
            Analysis Summary
          </Text>
          <VStack align="start" spacing={1} mt={2}>
            <Text fontSize="sm">
              • Writing complexity has changed by {Math.abs(deviations.vocabulary.value).toFixed(1)}% 
              {deviations.vocabulary.isSuspicious ? ' (unusually rapid change)' : ''}
            </Text>
            <Text fontSize="sm">
              • Sentence structures are {deviations.syntax.isSignificant ? 'significantly different' : 'consistent'} with previous work
            </Text>
            {currentSubmission.metrics.style.toneMarkers.length > 0 && (
              <Text fontSize="sm">
                • Writing tone shows {deviations.vocabulary.isSignificant ? 'notable changes' : 'typical patterns'}
              </Text>
            )}
          </VStack>
        </Box>

        {/* Historical Context */}
        <Text fontSize="xs" color="gray.500">
          Based on analysis of {previousSubmissions.length} previous submissions over {
            Math.round((new Date(currentSubmission.date).getTime() - 
                       new Date(previousSubmissions[0].date).getTime()) / 
                      (1000 * 60 * 60 * 24 * 30)
          )} months
        </Text>
      </VStack>
    </Box>
  );
}; 