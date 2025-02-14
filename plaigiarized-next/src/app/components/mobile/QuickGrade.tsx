'use client';

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useToast,
  Badge
} from '@chakra-ui/react';
import { FiCheck, FiX, FiMessageCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface QuickGradeProps {
  submissionId: string;
  studentName: string;
  essayTitle: string;
  onGrade: (id: string, score: number, feedback: string) => Promise<void>;
  onSkip: (id: string) => void;
}

export const QuickGrade: React.FC<QuickGradeProps> = ({
  submissionId,
  studentName,
  essayTitle,
  onGrade,
  onSkip
}) => {
  const [score, setScore] = useState(70);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleGrade = async () => {
    setIsSubmitting(true);
    try {
      await onGrade(submissionId, score, feedback);
      toast({
        title: 'Grade submitted',
        status: 'success',
        duration: 2000
      });
    } catch (error) {
      toast({
        title: 'Failed to submit grade',
        status: 'error',
        duration: 3000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Box
        bg="white"
        p={4}
        borderRadius="lg"
        shadow="md"
        maxW="100%"
        mx="auto"
      >
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">{studentName}</Text>
              <Text fontSize="sm" color="gray.600">{essayTitle}</Text>
            </VStack>
            <Badge colorScheme="blue">New</Badge>
          </HStack>

          <Box>
            <Text mb={2}>Score: {score}</Text>
            <Slider
              value={score}
              onChange={setScore}
              min={0}
              max={100}
              step={1}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb boxSize={6} />
            </Slider>
          </Box>

          <HStack spacing={4} justify="space-between">
            <IconButton
              aria-label="Skip"
              icon={<FiX />}
              colorScheme="gray"
              variant="ghost"
              onClick={() => onSkip(submissionId)}
            />
            <IconButton
              aria-label="Add feedback"
              icon={<FiMessageCircle />}
              colorScheme="blue"
              variant="ghost"
              onClick={() => {/* Open feedback modal */}}
            />
            <IconButton
              aria-label="Submit grade"
              icon={<FiCheck />}
              colorScheme="green"
              isLoading={isSubmitting}
              onClick={handleGrade}
            />
          </HStack>
        </VStack>
      </Box>
    </motion.div>
  );
}; 