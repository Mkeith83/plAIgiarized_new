'use client';

import React from 'react';
import { Box, VStack, Text, Grid, Flex, Tag, Progress } from '@chakra-ui/react';
import { DifferenceHighlighter } from './DifferenceHighlighter';

interface VocabularyAnalysisProps {
  newWords: string[];
  removedWords: string[];
  complexityChange: number;
}

export const VocabularyAnalysis: React.FC<VocabularyAnalysisProps> = ({
  newWords,
  removedWords,
  complexityChange
}) => {
  const getComplexityColor = (value: number) => {
    if (value > 0.2) return 'green';
    if (value > 0) return 'blue';
    return 'orange';
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Complexity Score */}
      <Box>
        <Text fontSize="sm" color="gray.600" mb={2}>Vocabulary Complexity Change</Text>
        <Flex align="center" gap={4}>
          <Progress
            value={50 + (complexityChange * 100)}
            min={0}
            max={100}
            colorScheme={getComplexityColor(complexityChange)}
            size="lg"
            width="70%"
          />
          <Text fontWeight="medium">
            {complexityChange > 0 ? '+' : ''}
            {(complexityChange * 100).toFixed(1)}%
          </Text>
        </Flex>
      </Box>

      {/* Word Changes */}
      <Grid templateColumns="1fr 1fr" gap={6}>
        {/* New Words */}
        <Box>
          <Flex justify="space-between" mb={2}>
            <Text fontSize="sm" color="gray.600">New Words Added</Text>
            <Tag colorScheme="green" size="sm">{newWords.length}</Tag>
          </Flex>
          <DifferenceHighlighter
            changes={newWords}
            type="addition"
          />
        </Box>

        {/* Removed Words */}
        <Box>
          <Flex justify="space-between" mb={2}>
            <Text fontSize="sm" color="gray.600">Words Removed</Text>
            <Tag colorScheme="red" size="sm">{removedWords.length}</Tag>
          </Flex>
          <DifferenceHighlighter
            changes={removedWords}
            type="removal"
          />
        </Box>
      </Grid>

      {/* Analysis Summary */}
      <Box p={4} bg="gray.50" borderRadius="md">
        <Text fontSize="sm" fontWeight="medium" mb={2}>Vocabulary Analysis Summary</Text>
        <Grid templateColumns="repeat(3, 1fr)" gap={4}>
          <Box>
            <Text fontSize="xs" color="gray.600">Net Change</Text>
            <Text fontWeight="medium">{newWords.length - removedWords.length}</Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.600">Unique Words</Text>
            <Text fontWeight="medium">{new Set([...newWords]).size}</Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.600">Complexity Score</Text>
            <Text fontWeight="medium">{((1 + complexityChange) * 100).toFixed(0)}</Text>
          </Box>
        </Grid>
      </Box>

      {/* Recommendations */}
      {complexityChange < 0 && (
        <Box p={3} bg="blue.50" borderRadius="md">
          <Text fontSize="sm" color="blue.700">
            💡 Tip: Consider incorporating more varied and sophisticated vocabulary
            while maintaining clarity and natural flow.
          </Text>
        </Box>
      )}
    </VStack>
  );
}; 