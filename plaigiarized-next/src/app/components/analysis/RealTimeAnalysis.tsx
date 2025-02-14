'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Progress,
  Badge,
  useToast
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisProcessor } from '../../../lib/services/analysisProcessor';
import type { WritingMetrics } from '../../../lib/interfaces/analysis';

interface RealTimeProps {
  content: string;
  baseline: WritingMetrics;
  onAnalysisComplete: (results: any) => void;
}

export const RealTimeAnalysis: React.FC<RealTimeProps> = ({
  content,
  baseline,
  onAnalysisComplete
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentMetric, setCurrentMetric] = useState('');
  const toast = useToast();
  const processor = new AnalysisProcessor();

  useEffect(() => {
    const analyzeContent = async () => {
      if (!content || content.length < 50) return;
      
      setIsAnalyzing(true);
      try {
        // Simulate analysis progress
        setCurrentMetric('Analyzing vocabulary...');
        setProgress(25);
        await new Promise(r => setTimeout(r, 500));
        
        setCurrentMetric('Checking patterns...');
        setProgress(50);
        await new Promise(r => setTimeout(r, 500));
        
        setCurrentMetric('Comparing to baseline...');
        setProgress(75);
        await new Promise(r => setTimeout(r, 500));
        
        // Actual analysis would happen here
        setProgress(100);
        onAnalysisComplete({});
        
      } catch (error) {
        toast({
          title: 'Analysis Error',
          description: 'Failed to analyze content',
          status: 'error'
        });
      } finally {
        setIsAnalyzing(false);
      }
    };

    const debounceTimeout = setTimeout(analyzeContent, 1000);
    return () => clearTimeout(debounceTimeout);
  }, [content]);

  return (
    <AnimatePresence>
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Box p={4} bg="white" borderRadius="lg" shadow="sm">
            <VStack spacing={3} align="stretch">
              <Text fontSize="sm" color="gray.600">
                {currentMetric}
              </Text>
              <Progress
                value={progress}
                size="sm"
                colorScheme="blue"
                hasStripe
                isAnimated
              />
            </VStack>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 