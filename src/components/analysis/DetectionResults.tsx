'use client';

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Progress,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { FiAlertTriangle, FiCheck, FiInfo } from 'react-icons/fi';
import { MetricsRadar } from '../visualization/MetricsRadar';
import { PatternTimeline } from '../visualization/PatternTimeline';
import { TrendIndicator } from '../visualization/TrendIndicator';
import type { WritingMetrics, MetricsComparison } from '@/lib/interfaces/metrics';

interface DetectionResultsProps {
  metrics: WritingMetrics;
  comparison: MetricsComparison;
  baseline?: WritingMetrics;
}

export const DetectionResults: React.FC<DetectionResultsProps> = ({
  metrics,
  comparison,
  baseline
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const getRiskLevel = (similarity: number): {
    label: string;
    color: string;
    icon: typeof FiCheck;
  } => {
    if (similarity > 0.9) {
      return { label: 'High Risk', color: 'red', icon: FiAlertTriangle };
    } else if (similarity > 0.7) {
      return { label: 'Medium Risk', color: 'yellow', icon: FiInfo };
    }
    return { label: 'Low Risk', color: 'green', icon: FiCheck };
  };

  const risk = getRiskLevel(comparison.similarity);

  return (
    <VStack spacing={6} w="100%" align="stretch">
      {/* Overall Risk Assessment */}
      <Box p={6} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
        <HStack spacing={4} align="center">
          <Icon as={risk.icon} boxSize={6} color={`${risk.color}.500`} />
          <VStack align="start" spacing={1}>
            <Text fontSize="lg" fontWeight="medium">
              {risk.label}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {(comparison.similarity * 100).toFixed(1)}% similarity with baseline
            </Text>
          </VStack>
          <Badge
            ml="auto"
            colorScheme={risk.color}
            fontSize="sm"
            px={3}
            py={1}
            borderRadius="full"
          >
            {(comparison.confidence * 100).toFixed(0)}% confidence
          </Badge>
        </HStack>
      </Box>

      {/* Metrics Comparison */}
      <Box p={6} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
        <Text fontSize="lg" fontWeight="medium" mb={4}>
          Writing Style Analysis
        </Text>
        <HStack spacing={8} align="start">
          <Box flex={1}>
            <MetricsRadar current={metrics} baseline={baseline} />
          </Box>
          <VStack flex={1} spacing={4} align="stretch">
            <TrendIndicator
              current={metrics.vocabulary.complexity}
              previous={baseline?.vocabulary.complexity || 0}
              threshold={0.2}
              label="Vocabulary Complexity"
            />
            <TrendIndicator
              current={metrics.style.tone.academic}
              previous={baseline?.style.tone.academic || 0}
              threshold={0.2}
              label="Academic Tone"
            />
            <TrendIndicator
              current={metrics.gradeLevel.overall}
              previous={baseline?.gradeLevel.overall || 0}
              threshold={0.2}
              label="Grade Level"
            />
          </VStack>
        </HStack>
      </Box>

      {/* Pattern Analysis */}
      <Box p={6} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
        <Text fontSize="lg" fontWeight="medium" mb={4}>
          Writing Pattern Changes
        </Text>
        <PatternTimeline
          patterns={comparison.differences.style.patterns.changed.map(change => ({
            date: metrics.timestamp.toISOString(),
            pattern: `${change.from} → ${change.to}`,
            type: change.significance > 0.8 ? 'new' : 'consistent',
            confidence: change.significance
          }))}
        />
      </Box>

      {/* Detailed Analysis */}
      <Accordion allowMultiple>
        <AccordionItem>
          <AccordionButton>
            <Text flex={1} fontWeight="medium">
              Vocabulary Analysis
            </Text>
          </AccordionButton>
          <AccordionPanel>
            {/* Vocabulary details */}
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton>
            <Text flex={1} fontWeight="medium">
              Style Analysis
            </Text>
          </AccordionButton>
          <AccordionPanel>
            {/* Style details */}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </VStack>
  );
}; 