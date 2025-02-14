'use client';

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Tooltip,
  Divider,
  useBreakpointValue
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiAlertCircle } from 'react-icons/fi';

interface StyleSnapshot {
  date: string;
  complexity: number;
  consistencyScore: number;
  majorChanges: {
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  vocabularyLevel: number;
  structureScore: number;
}

interface TimelineProps {
  studentId: string;
  snapshots: StyleSnapshot[];
  threshold: {
    normal: number;
    suspicious: number;
  };
}

export const WritingStyleTimeline: React.FC<TimelineProps> = ({
  studentId,
  snapshots,
  threshold
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  const getChangeColor = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    if (Math.abs(change) > threshold.suspicious) return 'red.500';
    if (Math.abs(change) > threshold.normal) return 'yellow.500';
    return 'green.500';
  };

  return (
    <Box bg="white" p={4} borderRadius="lg" shadow="md">
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold">
          Writing Style Evolution
        </Text>

        {/* Timeline View */}
        <VStack spacing={0} align="stretch">
          {snapshots.map((snapshot, index) => {
            const previousSnapshot = index > 0 ? snapshots[index - 1] : null;
            
            return (
              <React.Fragment key={index}>
                <HStack spacing={4} py={3}>
                  {/* Timeline Connector */}
                  <VStack spacing={0} align="center" minWidth="20px">
                    <Box
                      w="2px"
                      h="20px"
                      bg={index === 0 ? 'transparent' : 'gray.200'}
                    />
                    <Box
                      w="10px"
                      h="10px"
                      borderRadius="full"
                      bg={getChangeColor(
                        snapshot.complexity,
                        previousSnapshot?.complexity || snapshot.complexity
                      )}
                    />
                    <Box
                      w="2px"
                      h="20px"
                      bg={index === snapshots.length - 1 ? 'transparent' : 'gray.200'}
                    />
                  </VStack>

                  {/* Snapshot Content */}
                  <Box flex={1}>
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="sm" fontWeight="medium">
                        {new Date(snapshot.date).toLocaleDateString()}
                      </Text>
                      <Badge
                        colorScheme={snapshot.consistencyScore > 80 ? 'green' : 'yellow'}
                      >
                        {snapshot.consistencyScore}% match
                      </Badge>
                    </HStack>

                    {/* Changes Summary */}
                    {snapshot.majorChanges.map((change, changeIndex) => (
                      <HStack key={changeIndex} spacing={2} mt={1}>
                        {change.severity === 'high' && (
                          <FiAlertCircle color="red" />
                        )}
                        <Text fontSize="xs" color="gray.600">
                          {change.description}
                        </Text>
                      </HStack>
                    ))}

                    {/* Metrics */}
                    <HStack spacing={4} mt={2}>
                      <Tooltip label="Vocabulary Level">
                        <Badge variant="outline" colorScheme="blue">
                          V: {snapshot.vocabularyLevel}
                        </Badge>
                      </Tooltip>
                      <Tooltip label="Structure Score">
                        <Badge variant="outline" colorScheme="purple">
                          S: {snapshot.structureScore}
                        </Badge>
                      </Tooltip>
                    </HStack>
                  </Box>
                </HStack>
              </React.Fragment>
            );
          })}
        </VStack>

        {/* Summary */}
        <Box p={3} bg="gray.50" borderRadius="md">
          <Text fontSize="sm" fontWeight="medium">
            Overall Trend
          </Text>
          <Text fontSize="sm" color="gray.600" mt={1}>
            {snapshots.length > 1 ? (
              <>
                Writing style has {' '}
                {Math.abs(snapshots[snapshots.length - 1].consistencyScore - snapshots[0].consistencyScore) > threshold.suspicious
                  ? 'changed dramatically'
                  : 'evolved gradually'} 
                {' '}over {snapshots.length} submissions
              </>
            ) : (
              'Not enough data to establish trend'
            )}
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}; 