'use client';

import React, { useState } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  IconButton,
  useToast
} from '@chakra-ui/react';
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import { motion, PanInfo, useAnimation } from 'framer-motion';

interface SwipeGradeProps {
  submissionId: string;
  studentName: string;
  content: string;
  onGrade: (id: string, score: number) => Promise<void>;
}

export const SwipeGrade: React.FC<SwipeGradeProps> = ({
  submissionId,
  studentName,
  content,
  onGrade
}) => {
  const [isGrading, setIsGrading] = useState(false);
  const controls = useAnimation();
  const toast = useToast();

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    const swipeDistance = info.offset.x;

    if (Math.abs(swipeDistance) > threshold) {
      setIsGrading(true);
      const score = swipeDistance > 0 ? 100 : 0;

      try {
        await onGrade(submissionId, score);
        await controls.start({ x: swipeDistance * 2, opacity: 0 });
        toast({
          title: `Graded ${score === 100 ? 'Pass' : 'Fail'}`,
          status: score === 100 ? 'success' : 'error',
          duration: 2000
        });
      } catch (error) {
        controls.start({ x: 0 });
        toast({
          title: 'Failed to grade',
          status: 'error',
          duration: 3000
        });
      } finally {
        setIsGrading(false);
      }
    } else {
      controls.start({ x: 0 });
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      animate={controls}
      style={{ cursor: 'grab' }}
    >
      <Box
        bg="white"
        p={4}
        borderRadius="lg"
        shadow="md"
        position="relative"
        overflow="hidden"
      >
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <Text fontWeight="bold">{studentName}</Text>
            <HStack spacing={2}>
              <IconButton
                aria-label="Fail"
                icon={<FiThumbsDown />}
                colorScheme="red"
                variant="ghost"
                isDisabled={isGrading}
              />
              <IconButton
                aria-label="Pass"
                icon={<FiThumbsUp />}
                colorScheme="green"
                variant="ghost"
                isDisabled={isGrading}
              />
            </HStack>
          </HStack>

          <Text noOfLines={4} color="gray.600">
            {content}
          </Text>

          <Text fontSize="sm" color="gray.400" textAlign="center">
            Swipe right to pass, left to fail
          </Text>
        </VStack>

        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.1)',
            pointerEvents: 'none'
          }}
          animate={{
            opacity: isGrading ? 1 : 0
          }}
        />
      </Box>
    </motion.div>
  );
}; 