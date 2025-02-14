'use client';

import React from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { FiAlertTriangle, FiRefreshCcw } from 'react-icons/fi';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AnalysisErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Analysis Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          p={6}
          bg={useColorModeValue('white', 'gray.800')}
          borderRadius="lg"
          borderWidth={1}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
          <VStack spacing={4} align="center">
            <Icon as={FiAlertTriangle} boxSize={8} color="red.500" />
            <Text fontSize="lg" fontWeight="medium">
              Analysis Error
            </Text>
            <Text color="gray.600" textAlign="center">
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
            <Button
              leftIcon={<FiRefreshCcw />}
              onClick={() => window.location.reload()}
              colorScheme="blue"
            >
              Retry Analysis
            </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
} 