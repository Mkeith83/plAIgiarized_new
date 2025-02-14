'use client';

import React from 'react';
import { HStack, Text, Icon } from '@chakra-ui/react';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

interface TrendProps {
  current: number;
  previous: number;
  threshold: number;
  label: string;
}

export const TrendIndicator: React.FC<TrendProps> = ({
  current,
  previous,
  threshold,
  label
}) => {
  const change = ((current - previous) / previous) * 100;
  const isSignificant = Math.abs(change) > threshold;

  return (
    <HStack spacing={2}>
      <Icon
        as={change > 0 ? FiTrendingUp : change < 0 ? FiTrendingDown : FiMinus}
        color={isSignificant ? 'red.500' : 'green.500'}
      />
      <Text fontSize="sm" color={isSignificant ? 'red.600' : 'gray.600'}>
        {label}: {change > 0 ? '+' : ''}{change.toFixed(1)}%
      </Text>
    </HStack>
  );
}; 