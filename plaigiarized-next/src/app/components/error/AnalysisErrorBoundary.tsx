'use client';

import React, { Component, ErrorInfo } from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  Code,
  useToast
} from '@chakra-ui/react';
import { FiAlertTriangle } from 'react-icons/fi';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AnalysisErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Analysis error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Box p={4} bg="red.50" borderRadius="lg">
          <VStack spacing={3} align="stretch">
            <FiAlertTriangle size={24} color="red" />
            <Text fontWeight="medium">Analysis Error</Text>
            <Text fontSize="sm" color="gray.600">
              Something went wrong while analyzing the submission.
            </Text>
            <Code fontSize="xs" p={2}>
              {this.state.error?.message}
            </Code>
            <Button
              size="sm"
              onClick={() => this.setState({ hasError: false })}
            >
              Try Again
            </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
} 