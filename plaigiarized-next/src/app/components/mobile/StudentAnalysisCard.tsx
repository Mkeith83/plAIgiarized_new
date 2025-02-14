'use client';

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Progress,
  Badge,
  Collapse,
  Button,
  useDisclosure,
  Divider,
  Tooltip,
  SimpleGrid
} from '@chakra-ui/react';
import { FiChevronDown, FiChevronUp, FiAlertTriangle, FiTrendingUp, FiFileText, FiBrain } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface StyleMetrics {
  vocabularyComplexity: number;
  sentenceStructure: number;
  grammarAccuracy: number;
  typicalMistakes: string[];
}

interface BaselineComparison {
  styleDeviation: number;
  vocabularyShift: number;
  structureChange: number;
  commonPhrases: boolean;
  unusualPatterns: string[];
}

interface AIDetectionResult {
  probability: number;
  indicators: string[];
  confidence: number;
}

interface StudentAnalysisProps {
  submissionId: string;
  studentName: string;
  essayTitle: string;
  content: string;
  currentStyle: StyleMetrics;
  baselineComparison: BaselineComparison;
  aiDetection: AIDetectionResult;
  onFlag: (id: string, reason: string) => Promise<void>;
  onAccept: (id: string) => Promise<void>;
}

export const StudentAnalysisCard: React.FC<StudentAnalysisProps> = ({
  submissionId,
  studentName,
  essayTitle,
  content,
  currentStyle,
  baselineComparison,
  aiDetection,
  onFlag,
  onAccept
}) => {
  const { isOpen, onToggle } = useDisclosure();
  const [isProcessing, setIsProcessing] = useState(false);

  const getDeviationSeverity = (deviation: number) => {
    if (deviation < 20) return { color: 'green', text: 'Consistent with baseline' };
    if (deviation < 40) return { color: 'yellow', text: 'Slight deviation' };
    return { color: 'red', text: 'Significant deviation' };
  };

  const getAIRiskLevel = (probability: number) => {
    if (probability < 0.3) return { color: 'green', text: 'Low AI risk' };
    if (probability < 0.7) return { color: 'yellow', text: 'Medium AI risk' };
    return { color: 'red', text: 'High AI risk' };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Box bg="white" p={4} borderRadius="lg" shadow="md">
        <VStack spacing={4} align="stretch">
          {/* Header */}
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">{studentName}</Text>
              <Text fontSize="sm" color="gray.600">{essayTitle}</Text>
            </VStack>
            <HStack>
              <Badge 
                colorScheme={getDeviationSeverity(baselineComparison.styleDeviation).color}
                fontSize="sm"
              >
                Style Match
              </Badge>
              <Badge 
                colorScheme={getAIRiskLevel(aiDetection.probability).color}
                fontSize="sm"
              >
                AI Risk
              </Badge>
            </HStack>
          </HStack>

          {/* Quick Stats */}
          <SimpleGrid columns={2} spacing={4}>
            <Box p={3} bg="gray.50" borderRadius="md">
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="gray.600">Style Deviation</Text>
                <Progress 
                  value={baselineComparison.styleDeviation} 
                  colorScheme={getDeviationSeverity(baselineComparison.styleDeviation).color}
                  size="sm"
                  width="100%"
                />
                <Text fontSize="xs">{getDeviationSeverity(baselineComparison.styleDeviation).text}</Text>
              </VStack>
            </Box>

            <Box p={3} bg="gray.50" borderRadius="md">
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="gray.600">AI Probability</Text>
                <Progress 
                  value={aiDetection.probability * 100} 
                  colorScheme={getAIRiskLevel(aiDetection.probability).color}
                  size="sm"
                  width="100%"
                />
                <Text fontSize="xs">{getAIRiskLevel(aiDetection.probability).text}</Text>
              </VStack>
            </Box>
          </SimpleGrid>

          {/* Detailed Analysis Button */}
          <Button
            rightIcon={isOpen ? <FiChevronUp /> : <FiChevronDown />}
            variant="ghost"
            onClick={onToggle}
            size="sm"
          >
            View Detailed Analysis
          </Button>

          {/* Detailed Analysis */}
          <Collapse in={isOpen}>
            <VStack spacing={4} align="stretch">
              {/* Baseline Comparison */}
              <Box>
                <Text fontWeight="medium" mb={2}>Comparison to Student's Baseline</Text>
                <VStack align="start" spacing={2}>
                  {baselineComparison.unusualPatterns.map((pattern, index) => (
                    <Text key={index} fontSize="sm" color="gray.700">
                      • {pattern}
                    </Text>
                  ))}
                </VStack>
              </Box>

              {/* AI Indicators */}
              <Box>
                <Text fontWeight="medium" mb={2}>AI Detection Indicators</Text>
                <VStack align="start" spacing={2}>
                  {aiDetection.indicators.map((indicator, index) => (
                    <Text key={index} fontSize="sm" color="gray.700">
                      • {indicator}
                    </Text>
                  ))}
                </VStack>
              </Box>

              {/* Style Changes */}
              <Box>
                <Text fontWeight="medium" mb={2}>Writing Style Changes</Text>
                <SimpleGrid columns={2} spacing={3}>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Vocabulary Shift</Text>
                    <Text fontSize="sm">{baselineComparison.vocabularyShift}% change</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Structure Change</Text>
                    <Text fontSize="sm">{baselineComparison.structureChange}% change</Text>
                  </Box>
                </SimpleGrid>
              </Box>
            </VStack>
          </Collapse>

          <Divider />

          {/* Action Buttons */}
          <HStack justify="space-around">
            <IconButton
              aria-label="Accept as authentic"
              icon={<FiFileText />}
              colorScheme="green"
              isLoading={isProcessing}
              onClick={() => onAccept(submissionId)}
            />
            <IconButton
              aria-label="Flag for review"
              icon={<FiAlertTriangle />}
              colorScheme="red"
              isLoading={isProcessing}
              onClick={() => onFlag(submissionId, 'Suspicious style changes and AI indicators')}
            />
          </HStack>
        </VStack>
      </Box>
    </motion.div>
  );
}; 