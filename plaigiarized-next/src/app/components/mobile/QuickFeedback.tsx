'use client';

import React, { useState } from 'react';
import {
  Box,
  VStack,
  Button,
  Text,
  Textarea,
  useToast,
  Wrap,
  WrapItem,
  Tag
} from '@chakra-ui/react';

interface QuickFeedbackProps {
  submissionId: string;
  predefinedComments?: string[];
  onSubmit: (feedback: string) => Promise<void>;
}

export const QuickFeedback: React.FC<QuickFeedbackProps> = ({
  submissionId,
  predefinedComments = [
    'Great work!',
    'Needs improvement',
    'Check grammar',
    'Expand on this point',
    'Add more examples',
    'Good structure'
  ],
  onSubmit
}) => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleAddPredefinedComment = (comment: string) => {
    setFeedback(prev => prev ? `${prev}\n${comment}` : comment);
  };

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast({
        title: 'Please add some feedback',
        status: 'warning',
        duration: 2000
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(feedback);
      toast({
        title: 'Feedback submitted',
        status: 'success',
        duration: 2000
      });
      setFeedback('');
    } catch (error) {
      toast({
        title: 'Failed to submit feedback',
        status: 'error',
        duration: 3000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box p={4}>
      <VStack spacing={4} align="stretch">
        <Text fontWeight="medium">Quick Comments</Text>
        <Wrap spacing={2}>
          {predefinedComments.map((comment, index) => (
            <WrapItem key={index}>
              <Tag
                size="md"
                variant="subtle"
                colorScheme="blue"
                cursor="pointer"
                onClick={() => handleAddPredefinedComment(comment)}
              >
                {comment}
              </Tag>
            </WrapItem>
          ))}
        </Wrap>

        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Add your feedback here..."
          rows={6}
        />

        <Button
          colorScheme="blue"
          isLoading={isSubmitting}
          onClick={handleSubmit}
        >
          Submit Feedback
        </Button>
      </VStack>
    </Box>
  );
}; 