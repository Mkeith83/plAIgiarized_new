'use client';

import React from 'react';
import { Box, SimpleGrid, Text, useColorModeValue } from '@chakra-ui/react';

interface PatternHeatmapProps {
  data: Array<{
    pattern: string;
    frequency: number;
    significance: number;
  }>;
  maxColumns?: number;
}

export const PatternHeatmap: React.FC<PatternHeatmapProps> = ({
  data,
  maxColumns = 4
}) => {
  const getHeatColor = (significance: number) => {
    if (significance > 0.8) return 'red.100';
    if (significance > 0.5) return 'yellow.100';
    return 'green.100';
  };

  return (
    <SimpleGrid columns={maxColumns} spacing={4}>
      {data.map((item, index) => (
        <Box
          key={index}
          p={4}
          bg={getHeatColor(item.significance)}
          borderRadius="md"
          transition="all 0.2s"
          _hover={{ transform: 'scale(1.02)' }}
        >
          <Text fontWeight="medium" mb={2}>
            {item.pattern}
          </Text>
          <Text fontSize="sm" color="gray.600">
            Significance: {(item.significance * 100).toFixed(1)}%
          </Text>
        </Box>
      ))}
    </SimpleGrid>
  );
}; 