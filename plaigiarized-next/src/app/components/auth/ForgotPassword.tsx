'use client';

import React, { useState } from 'react';
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Link,
  useToast,
  FormErrorMessage,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const router = useRouter();

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setIsEmailSent(true);
      toast({
        title: 'Reset email sent',
        description: 'Please check your inbox for further instructions',
        status: 'success',
        duration: 5000
      });
    } catch (error) {
      setError('Failed to send reset email. Please try again.');
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box width="100%" maxW="400px">
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold" textAlign="center">
          Reset Password
        </Text>

        {isEmailSent ? (
          <Alert status="success">
            <AlertIcon />
            <VStack align="stretch" spacing={4}>
              <Text>
                We've sent you an email with instructions to reset your password.
              </Text>
              <Button
                variant="link"
                colorScheme="blue"
                onClick={() => router.push('/auth/login')}
              >
                Return to login
              </Button>
            </VStack>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <Text color="gray.600" textAlign="center">
                Enter your email address and we'll send you instructions to reset your password.
              </Text>

              <FormControl isInvalid={!!error}>
                <FormLabel>Email address</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
                <FormErrorMessage>{error}</FormErrorMessage>
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                width="100%"
                isLoading={isLoading}
              >
                Send Reset Link
              </Button>

              <Link
                href="/auth/login"
                color="blue.500"
                textAlign="center"
                width="100%"
              >
                Back to Login
              </Link>
            </VStack>
          </form>
        )}
      </VStack>
    </Box>
  );
}; 