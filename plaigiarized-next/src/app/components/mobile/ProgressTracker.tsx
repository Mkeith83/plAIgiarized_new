'use client';

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  CircularProgress,
  CircularProgressLabel,
  SimpleGrid,
  useBreakpointValue
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

interface ProgressStats {
  totalSubmissions: number;
  gradedSubmissions: number;
  averageScore: number;
  completionRate: number;
  weeklyProgress: {
    day: string;
    count: number;
  }[];
}

interface ProgressTrackerProps {
  stats: ProgressStats;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ stats }) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  const MotionBox = motion(Box);

  return (
    <VStack spacing={6} align="stretch" w="100%">
      <SimpleGrid columns={2} spacing={4}>
        <MotionBox
          whileTap={{ scale: 0.95 }}
          bg="white"
          p={4}
          borderRadius="lg"
          shadow="sm"
        >
          <VStack spacing={2}>
            <CircularProgress
              value={stats.completionRate}
              size={isMobile ? "100px" : "120px"}
              thickness="8px"
              color="green.400"
            >
              <CircularProgressLabel>
                {stats.completionRate}%
              </CircularProgressLabel>
            </CircularProgress>
            <Text fontSize="sm" color="gray.600">
              Completion Rate
            </Text>
          </VStack>
        </MotionBox>

        <MotionBox
          whileTap={{ scale: 0.95 }}
          bg="white"
          p={4}
          borderRadius="lg"
          shadow="sm"
        >
          <VStack spacing={2} h="100%" justify="center">
            <Text fontSize="2xl" fontWeight="bold" color="blue.500">
              {stats.averageScore}%
            </Text>
            <Text fontSize="sm" color="gray.600">
              Average Score
            </Text>
            <Text fontSize="xs" color="gray.400">
              {stats.gradedSubmissions} graded
            </Text>
          </VStack>
        </MotionBox>
      </SimpleGrid>

      <Box bg="white" p={4} borderRadius="lg" shadow="sm">
        <Text fontSize="sm" fontWeight="medium" mb={2}>
          Weekly Progress
        </Text>
        <HStack spacing={2} h="60px">
          {stats.weeklyProgress.map((day, index) => (
            <VStack key={index} flex={1} spacing={1}>
              <Box
                h={`${(day.count / Math.max(...stats.weeklyProgress.map(d => d.count))) * 100}%`}
                w="100%"
                bg="blue.400"
                borderRadius="sm"
                transition="height 0.2s"
              />
              <Text fontSize="xs" color="gray.600">
                {day.day}
              </Text>
            </VStack>
          ))}
        </HStack>
      </Box>
    </VStack>
  );
}; 