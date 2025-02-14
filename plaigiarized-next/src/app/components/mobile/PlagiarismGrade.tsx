'use client';

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Progress,
  Badge,
  Collapse,
  Button,
  useDisclosure,
  Divider
} from '@chakra-ui/react';
import { FiChevronDown, FiChevronUp, FiFlag, FiCheck, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface SimilarityMatch {
  sourceText: string;
  matchedText: string;
  similarity: number;
  sourceName: string;
}

interface PlagiarismGradeProps {
  submissionId: string;
  studentName: string;
  essayTitle: string;
  content: string;
  similarityScore: number;
  matches: SimilarityMatch[];
  onMarkPlagiarized: (id: string, matches: SimilarityMatch[]) => Promise<void>;
  onMarkOriginal: (id: string) => Promise<void>;
}

export const PlagiarismGrade: React.FC<PlagiarismGradeProps> = ({
  submissionId,
  studentName,
  essayTitle,
  content,
  similarityScore,
  matches,
  onMarkPlagiarized,
  onMarkOriginal
}) => {
  const { isOpen, onToggle } = useDisclosure();
  const [isProcessing, setIsProcessing] = useState(false);

  const getSimilarityColor = (score: number) => {
    if (score < 20) return 'green';
    if (score < 40) return 'yellow';
    return 'red';
  };

  const handleMarkPlagiarized = async () => {
    setIsProcessing(true);
    try {
      await onMarkPlagiarized(submissionId, matches);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkOriginal = async () => {
    setIsProcessing(true);
    try {
      await onMarkOriginal(submissionId);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Box bg="white" p={4} borderRadius="lg" shadow="md">
        <VStack spacing={4} align="stretch">
          {/* Header */}
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">{studentName}</Text>
              <Text fontSize="sm" color="gray.600">{essayTitle}</Text>
            </VStack>
            <Badge 
              colorScheme={getSimilarityColor(similarityScore)}
              fontSize="md"
              p={2}
              borderRadius="md"
            >
              {similarityScore}% Similar
            </Badge>
          </HStack>

          {/* Similarity Progress */}
          <Box>
            <Progress 
              value={similarityScore} 
              colorScheme={getSimilarityColor(similarityScore)}
              borderRadius="full"
              size="lg"
            />
          </Box>

          {/* Matches Preview */}
          <Button
            rightIcon={isOpen ? <FiChevronUp /> : <FiChevronDown />}
            variant="ghost"
            onClick={onToggle}
            size="sm"
          >
            {matches.length} potential matches found
          </Button>

          {/* Detailed Matches */}
          <Collapse in={isOpen}>
            <VStack spacing={3} align="stretch">
              {matches.map((match, index) => (
                <Box 
                  key={index}
                  p={3}
                  bg="gray.50"
                  borderRadius="md"
                  fontSize="sm"
                >
                  <Text fontWeight="medium" mb={1}>
                    Match from: {match.sourceName}
                  </Text>
                  <Text color="red.500" mb={2}>
                    {match.matchedText}
                  </Text>
                  <Text color="gray.600">
                    Original: {match.sourceText}
                  </Text>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {match.similarity}% similar
                  </Text>
                </Box>
              ))}
            </VStack>
          </Collapse>

          <Divider />

          {/* Action Buttons */}
          <HStack justify="space-between">
            <IconButton
              aria-label="Mark as original"
              icon={<FiCheck />}
              colorScheme="green"
              isLoading={isProcessing}
              onClick={handleMarkOriginal}
            />
            <IconButton
              aria-label="Flag as plagiarized"
              icon={<FiFlag />}
              colorScheme="red"
              isLoading={isProcessing}
              onClick={handleMarkPlagiarized}
            />
          </HStack>
        </VStack>
      </Box>
    </motion.div>
  );
}; 