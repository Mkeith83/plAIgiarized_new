'use client';

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  SimpleGrid,
  Progress,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon
} from '@chakra-ui/react';
import { FiCheck, FiAlertTriangle, FiTrendingUp, FiRepeat } from 'react-icons/fi';

interface Pattern {
  type: 'phrase' | 'structure' | 'transition' | 'vocabulary';
  content: string;
  frequency: number;
  isTypical: boolean;
  confidence: number;
}

interface WritingPatternProps {
  studentId: string;
  patterns: {
    common: Pattern[];
    new: Pattern[];
    missing: Pattern[];
  };
  timespan: {
    start: string;
    end: string;
  };
}

export const WritingPatternAnalysis: React.FC<WritingPatternProps> = ({
  studentId,
  patterns,
  timespan
}) => {
  const getPatternIndicator = (pattern: Pattern) => {
    if (!pattern.isTypical && pattern.confidence > 0.8) {
      return {
        icon: FiAlertTriangle,
        color: 'red.500',
        label: 'Unusual Pattern'
      };
    }
    return {
      icon: FiCheck,
      color: 'green.500',
      label: 'Typical Pattern'
    };
  };

  return (
    <Box bg="white" p={4} borderRadius="lg" shadow="md">
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold">
          Writing Pattern Details
        </Text>

        <Accordion allowMultiple>
          {/* Common Patterns */}
          <AccordionItem>
            <AccordionButton>
              <Box flex="1">
                <HStack>
                  <FiRepeat />
                  <Text fontWeight="medium">Common Patterns</Text>
                  <Badge colorScheme="green">{patterns.common.length}</Badge>
                </HStack>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <List spacing={2}>
                {patterns.common.map((pattern, index) => (
                  <ListItem key={index}>
                    <HStack justify="space-between">
                      <Text fontSize="sm">{pattern.content}</Text>
                      <Badge>
                        {pattern.frequency}x
                      </Badge>
                    </HStack>
                  </ListItem>
                ))}
              </List>
            </AccordionPanel>
          </AccordionItem>

          {/* New Patterns */}
          <AccordionItem>
            <AccordionButton>
              <Box flex="1">
                <HStack>
                  <FiTrendingUp />
                  <Text fontWeight="medium">New Patterns</Text>
                  <Badge colorScheme={patterns.new.length > 5 ? 'red' : 'yellow'}>
                    {patterns.new.length}
                  </Badge>
                </HStack>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <List spacing={2}>
                {patterns.new.map((pattern, index) => (
                  <ListItem key={index}>
                    <VStack align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm">{pattern.content}</Text>
                        <Badge 
                          colorScheme={pattern.confidence > 0.8 ? 'red' : 'yellow'}
                        >
                          {(pattern.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                      </HStack>
                      <Progress 
                        size="xs"
                        value={pattern.confidence * 100}
                        colorScheme={pattern.confidence > 0.8 ? 'red' : 'yellow'}
                      />
                    </VStack>
                  </ListItem>
                ))}
              </List>
            </AccordionPanel>
          </AccordionItem>

          {/* Missing Typical Patterns */}
          <AccordionItem>
            <AccordionButton>
              <Box flex="1">
                <HStack>
                  <FiAlertTriangle />
                  <Text fontWeight="medium">Missing Typical Patterns</Text>
                  <Badge colorScheme="orange">{patterns.missing.length}</Badge>
                </HStack>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <List spacing={2}>
                {patterns.missing.map((pattern, index) => (
                  <ListItem key={index}>
                    <Text fontSize="sm" color="gray.600">
                      {pattern.content}
                    </Text>
                  </ListItem>
                ))}
              </List>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

        <Box p={3} bg="gray.50" borderRadius="md">
          <Text fontSize="sm" fontWeight="medium">
            Key Observations
          </Text>
          <List spacing={1} mt={2}>
            {patterns.new.length > 5 && (
              <ListItem fontSize="sm" color="red.500">
                <ListIcon as={FiAlertTriangle} />
                Unusually high number of new patterns
              </ListItem>
            )}
            {patterns.missing.length > 3 && (
              <ListItem fontSize="sm" color="orange.500">
                <ListIcon as={FiAlertTriangle} />
                Several typical patterns missing
              </ListItem>
            )}
            <ListItem fontSize="sm" color="gray.600">
              <ListIcon as={FiCheck} />
              {patterns.common.length} consistent patterns identified
            </ListItem>
          </List>
        </Box>
      </VStack>
    </Box>
  );
}; 