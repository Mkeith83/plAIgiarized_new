'use client';

import React from 'react';
import {
  Box,
  VStack,
  Text,
  Progress,
  Spinner,
  useColorModeValue
} from '@chakra-ui/react';

interface AnalysisLoadingProps {
  message?: string;
  progress?: number;
  showSpinner?: boolean;
}

export const AnalysisLoading: React.FC<AnalysisLoadingProps> = ({
  message = 'Analyzing document...',
  progress,
  showSpinner = true
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="lg"
      borderWidth={1}
      borderColor={borderColor}
    >
      <VStack spacing={4} align="center">
        {showSpinner && (
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
        )}
        <Text fontSize="lg" fontWeight="medium">
          {message}
        </Text>
        {typeof progress === 'number' && (
          <Box w="100%">
            <Progress
              value={progress}
              size="sm"
              colorScheme="blue"
              hasStripe
              isAnimated
            />
            <Text
              fontSize="sm"
              color="gray.600"
              textAlign="center"
              mt={2}
            >
              {progress.toFixed(0)}% complete
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}; 