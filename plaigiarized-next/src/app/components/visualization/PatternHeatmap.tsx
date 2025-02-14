'use client';

import React from 'react';
import { Box, VStack, Text, SimpleGrid, Tooltip } from '@chakra-ui/react';

interface HeatmapProps {
  data: {
    pattern: string;
    frequency: number;
    significance: number;
  }[];
  maxColumns?: number;
}

export const PatternHeatmap: React.FC<HeatmapProps> = ({ 
  data,
  maxColumns = 4
}) => {
  const getHeatColor = (frequency: number, significance: number) => {
    const intensity = Math.min(frequency * significance, 1);
    return `rgba(66, 153, 225, ${intensity})`;
  };

  return (
    <SimpleGrid columns={maxColumns} spacing={2}>
      {data.map((item, index) => (
        <Tooltip
          key={index}
          label={`Frequency: ${(item.frequency * 100).toFixed(1)}%`}
        >
          <Box
            p={2}
            bg={getHeatColor(item.frequency, item.significance)}
            borderRadius="md"
            cursor="pointer"
          >
            <Text fontSize="xs" color="gray.700" noOfLines={1}>
              {item.pattern}
            </Text>
          </Box>
        </Tooltip>
      ))}
    </SimpleGrid>
  );
}; 