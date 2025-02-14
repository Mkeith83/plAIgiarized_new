'use client';

import React from 'react';
import { Box, HStack, Text, Icon } from '@chakra-ui/react';
import { FiArrowUp, FiArrowDown, FiMinus } from 'react-icons/fi';

interface TrendIndicatorProps {
  current: number;
  previous: number;
  threshold: number;
  label: string;
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  current,
  previous,
  threshold,
  label
}) => {
  const change = ((current - previous) / previous) * 100;
  const isSignificant = Math.abs(change) > threshold * 100;

  const getIndicator = () => {
    if (!isSignificant) {
      return {
        icon: FiMinus,
        color: 'gray.500',
        text: 'No significant change'
      };
    }
    if (change > 0) {
      return {
        icon: FiArrowUp,
        color: 'green.500',
        text: `Increased by ${change.toFixed(1)}%`
      };
    }
    return {
      icon: FiArrowDown,
      color: 'red.500',
      text: `Decreased by ${Math.abs(change).toFixed(1)}%`
    };
  };

  const indicator = getIndicator();

  return (
    <Box p={4} borderWidth={1} borderRadius="md">
      <Text fontSize="sm" color="gray.600" mb={2}>
        {label}
      </Text>
      <HStack spacing={2}>
        <Icon as={indicator.icon} color={indicator.color} />
        <Text color={indicator.color}>{indicator.text}</Text>
      </HStack>
    </Box>
  );
}; 