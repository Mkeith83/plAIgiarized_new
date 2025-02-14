'use client';

import React from 'react';
import { Box, VStack, Text, Grid, Badge, Divider } from '@chakra-ui/react';
import { BaselineComparison } from '@/lib/interfaces/analysis/baselineInterface';
import { DifferenceHighlighter } from './DifferenceHighlighter';

interface StyleAnalysisProps {
  differences: BaselineComparison['differences']['style'];
  confidence: number;
}

export const StyleAnalysis: React.FC<StyleAnalysisProps> = ({
  differences,
  confidence
}) => {
  const getConfidenceColor = (value: number) => {
    if (value >= 0.8) return 'green';
    if (value >= 0.6) return 'yellow';
    return 'red';
  };

  return (
    <VStack spacing={4} align="stretch">
      {/* Confidence Indicator */}
      <Box mb={4}>
        <Text fontSize="sm" color="gray.600" mb={1}>Analysis Confidence</Text>
        <Badge 
          colorScheme={getConfidenceColor(confidence)}
          fontSize="md"
          px={3}
          py={1}
        >
          {(confidence * 100).toFixed(1)}%
        </Badge>
      </Box>

      <Divider />

      {/* Pattern Changes */}
      <Box>
        <Text fontSize="sm" color="gray.600" mb={2}>Writing Pattern Changes</Text>
        <DifferenceHighlighter 
          changes={differences.patternChanges}
          type="change"
        />
      </Box>

      <Divider />

      {/* Complexity Analysis */}
      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
        <Box>
          <Text fontSize="sm" color="gray.600" mb={1}>Complexity Change</Text>
          <Text fontSize="lg" fontWeight="medium">
            {differences.complexityDelta > 0 ? '+' : ''}
            {differences.complexityDelta.toFixed(2)}
          </Text>
        </Box>
        <Box>
          <Text fontSize="sm" color="gray.600" mb={1}>Consistency Score</Text>
          <Text fontSize="lg" fontWeight="medium">
            {(differences.consistencyScore * 100).toFixed(1)}%
          </Text>
        </Box>
      </Grid>

      {/* Style Indicators */}
      <Box mt={4}>
        <Text fontSize="sm" color="gray.600" mb={2}>Style Indicators</Text>
        <Grid templateColumns="repeat(2, 1fr)" gap={3}>
          {differences.patternChanges.map((pattern, index) => (
            <Box 
              key={index}
              p={2}
              bg="gray.50"
              borderRadius="md"
              fontSize="sm"
            >
              {pattern}
            </Box>
          ))}
        </Grid>
      </Box>

      {/* Recommendations */}
      {differences.consistencyScore < 0.7 && (
        <Box mt={4} p={3} bg="blue.50" borderRadius="md">
          <Text fontSize="sm" color="blue.700">
            💡 Tip: The writing style shows significant variations. Consider maintaining
            more consistent sentence structures and transitions.
          </Text>
        </Box>
      )}
    </VStack>
  );
}; 