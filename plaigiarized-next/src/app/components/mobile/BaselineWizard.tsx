'use client';

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Progress,
  Badge,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepTitle,
  StepDescription,
  useToast
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiCheck, FiAlertTriangle } from 'react-icons/fi';

// Import existing services and types
import type { WritingMetrics, BaselineData } from '../../../lib/interfaces/analysis';
import { analyzeWritingStyle } from '../../../lib/analysis/styleAnalyzer';
import { calculateBaseline } from '../../../lib/analysis/baselineAnalyzer';
import { detectAnomalies } from '../../../lib/ai/detector';
import { generateFingerprint } from '../../../lib/ai/fingerprint';

interface BaselineWizardProps {
  studentId: string;
  submissions: {
    id: string;
    content: string;
    date: string;
  }[];
  onBaselineEstablished: (baseline: WritingMetrics) => void;
}

export const BaselineWizard: React.FC<BaselineWizardProps> = ({
  studentId,
  submissions,
  onBaselineEstablished
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{
    styleMetrics?: WritingMetrics;
    fingerprint?: string;
    anomalies?: string[];
    confidence: number;
  }>({ confidence: 0 });
  const toast = useToast();

  const steps = [
    { title: 'Analyze Submissions', description: 'Processing writing style' },
    { title: 'Generate Fingerprint', description: 'Creating style fingerprint' },
    { title: 'Validate Baseline', description: 'Checking consistency' }
  ];

  const processStep = async () => {
    setIsProcessing(true);
    try {
      switch (activeStep) {
        case 0:
          // Use existing styleAnalyzer
          const styleMetrics = await analyzeWritingStyle(submissions);
          setResults(prev => ({ ...prev, styleMetrics }));
          break;

        case 1:
          // Use existing fingerprint generator
          const fingerprint = await generateFingerprint(results.styleMetrics!);
          setResults(prev => ({ ...prev, fingerprint }));
          break;

        case 2:
          // Use existing baseline analyzer and anomaly detector
          const baseline = await calculateBaseline(submissions);
          const anomalies = await detectAnomalies(submissions, baseline);
          const confidence = anomalies.length === 0 ? 100 : 
            Math.max(0, 100 - (anomalies.length * 15));
          
          setResults(prev => ({ 
            ...prev, 
            anomalies,
            confidence 
          }));

          if (confidence >= 70) {
            onBaselineEstablished(results.styleMetrics!);
          }
          break;
      }
      setActiveStep(prev => prev + 1);
    } catch (error) {
      toast({
        title: 'Error processing baseline',
        status: 'error',
        duration: 3000
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box bg="white" p={4} borderRadius="lg" shadow="md">
      <VStack spacing={6} align="stretch">
        <Stepper index={activeStep}>
          {steps.map((step, index) => (
            <Step key={index}>
              <StepIndicator>
                <StepStatus
                  complete={<FiCheck />}
                  incomplete={index + 1}
                  active={index + 1}
                />
              </StepIndicator>
              <Box flexShrink='0'>
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </Box>
            </Step>
          ))}
        </Stepper>

        {/* Results Display */}
        <VStack spacing={3} align="stretch">
          {results.styleMetrics && (
            <Box p={3} bg="gray.50" borderRadius="md">
              <Text fontSize="sm" fontWeight="medium">Style Analysis</Text>
              <HStack mt={2}>
                <Badge colorScheme="blue">
                  {results.styleMetrics.vocabulary.complexityScore.toFixed(1)} complexity
                </Badge>
                <Badge colorScheme="green">
                  {results.styleMetrics.syntax.consistencyScore.toFixed(1)}% consistent
                </Badge>
              </HStack>
            </Box>
          )}

          {results.anomalies && results.anomalies.length > 0 && (
            <Box p={3} bg="red.50" borderRadius="md">
              <HStack>
                <FiAlertTriangle color="red" />
                <Text fontSize="sm" fontWeight="medium">Anomalies Detected</Text>
              </HStack>
              <Text fontSize="xs" color="red.600" mt={1}>
                {results.anomalies.length} potential inconsistencies found
              </Text>
            </Box>
          )}

          {/* Confidence Score */}
          {results.confidence > 0 && (
            <Box>
              <Text fontSize="sm" mb={1}>Baseline Confidence</Text>
              <Progress
                value={results.confidence}
                colorScheme={results.confidence >= 70 ? 'green' : 'yellow'}
                borderRadius="full"
              />
            </Box>
          )}
        </VStack>

        <Button
          colorScheme="blue"
          isLoading={isProcessing}
          onClick={processStep}
          isDisabled={activeStep >= steps.length}
        >
          {activeStep >= steps.length ? 'Complete' : 'Continue'}
        </Button>
      </VStack>
    </Box>
  );
}; 