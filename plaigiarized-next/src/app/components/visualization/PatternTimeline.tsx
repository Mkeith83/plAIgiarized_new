'use client';

import React from 'react';
import { Box, VStack, HStack, Text, Badge } from '@chakra-ui/react';
import { motion } from 'framer-motion';

interface TimelineProps {
  patterns: {
    date: string;
    pattern: string;
    type: 'new' | 'consistent' | 'missing';
    confidence: number;
  }[];
}

export const PatternTimeline: React.FC<TimelineProps> = ({ patterns }) => {
  const getPatternColor = (type: string) => {
    switch (type) {
      case 'new': return 'yellow.500';
      case 'consistent': return 'green.500';
      case 'missing': return 'red.500';
      default: return 'gray.500';
    }
  };

  return (
    <VStack spacing={0} align="stretch">
      {patterns.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <HStack spacing={3} p={2}>
            <Box
              w="2px"
              h="full"
              bg={getPatternColor(item.type)}
              position="relative"
            />
            <VStack align="start" spacing={1}>
              <Text fontSize="xs" color="gray.500">
                {new Date(item.date).toLocaleDateString()}
              </Text>
              <Text fontSize="sm">{item.pattern}</Text>
              <Badge colorScheme={item.confidence > 0.8 ? 'green' : 'yellow'}>
                {(item.confidence * 100).toFixed(0)}% confidence
              </Badge>
            </VStack>
          </HStack>
        </motion.div>
      ))}
    </VStack>
  );
}; 