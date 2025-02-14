'use client';

import React from 'react';
import { Box, Grid, Text, Progress, Tooltip, VStack } from '@chakra-ui/react';
import { BaselineComparison } from '@/lib/interfaces/analysis/baselineInterface';

interface MetricsComparisonProps {
  differences: BaselineComparison['differences']['metrics'];
  flags: BaselineComparison['flags'];
}

export const MetricsComparison: React.FC<MetricsComparisonProps> = ({
  differences,
  flags
}) => {
  const getProgressColor = (value: number) => {
    if (value > 0.2) return 'orange.400';
    if (value > 0.1) return 'yellow.400';
    return 'green.400';
  };

  const formatChange = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${(value * 100).toFixed(1)}%`;
  };

  return (
    <VStack spacing={4} align="stretch">
      {/* Grade Level Change */}
      <Box>
        <Tooltip 
          label={flags.suddenImprovements.includes('gradeLevel') ? 
            'Unusual grade level improvement detected' : 
            'Normal grade level change'
          }
        >
          <Text mb={2} fontWeight="medium">
            Grade Level Change {formatChange(differences.gradeLevelChange)}
            {flags.suddenImprovements.includes('gradeLevel') && ' ⚠️'}
          </Text>
        </Tooltip>
        <Progress 
          value={Math.abs(differences.gradeLevelChange * 100)}
          max={100}
          colorScheme={getProgressColor(Math.abs(differences.gradeLevelChange))}
          borderRadius="full"
        />
      </Box>

      {/* Readability Change */}
      <Box>
        <Text mb={2} fontWeight="medium">
          Readability Change {formatChange(differences.readabilityChange)}
        </Text>
        <Progress 
          value={Math.abs(differences.readabilityChange * 100)}
          max={100}
          colorScheme={getProgressColor(Math.abs(differences.readabilityChange))}
          borderRadius="full"
        />
      </Box>

      {/* Overall Change */}
      <Box>
        <Tooltip 
          label={flags.suddenImprovements.length > 0 ? 
            'Multiple significant improvements detected' : 
            'Normal overall change'
          }
        >
          <Text mb={2} fontWeight="medium">
            Overall Change {formatChange(differences.overallChange)}
            {flags.suddenImprovements.length > 0 && ' ⚠️'}
          </Text>
        </Tooltip>
        <Progress 
          value={Math.abs(differences.overallChange * 100)}
          max={100}
          colorScheme={getProgressColor(Math.abs(differences.overallChange))}
          borderRadius="full"
        />
      </Box>

      {/* Summary Stats */}
      <Grid templateColumns="repeat(2, 1fr)" gap={4} mt={4}>
        <Box p={3} borderRadius="md" bg="gray.50">
          <Text fontSize="sm" color="gray.600">Total Improvements</Text>
          <Text fontSize="lg" fontWeight="bold">
            {Object.values(differences).filter(v => v > 0).length}
          </Text>
        </Box>
        <Box p={3} borderRadius="md" bg="gray.50">
          <Text fontSize="sm" color="gray.600">Warning Count</Text>
          <Text fontSize="lg" fontWeight="bold" color={flags.warnings.length > 0 ? 'orange.500' : 'inherit'}>
            {flags.warnings.length}
          </Text>
        </Box>
      </Grid>
    </VStack>
  );
}; 