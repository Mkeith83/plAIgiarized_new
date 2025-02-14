'use client';

import React, { useState } from 'react';
import { Box, Grid, Heading, Text, Flex, Button, Select } from '@chakra-ui/react';
import { BaselineComparison } from '@/lib/interfaces/analysis/baselineInterface';
import { DifferenceHighlighter } from './DifferenceHighlighter';
import { MetricsComparison } from './MetricsComparison';
import { StyleAnalysis } from './StyleAnalysis';
import { VocabularyAnalysis } from './VocabularyAnalysis';

interface ComparisonViewProps {
  studentId: string;
  essayId: string;
  baselineId: string;
  comparison: BaselineComparison;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  studentId,
  essayId,
  baselineId,
  comparison
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'style' | 'vocabulary'>('overview');

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Essay Comparison Analysis</Heading>
        <Select 
          width="200px"
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as typeof activeTab)}
        >
          <option value="overview">Overview</option>
          <option value="style">Style Analysis</option>
          <option value="vocabulary">Vocabulary Analysis</option>
        </Select>
      </Flex>

      {/* Similarity Score */}
      <Box mb={8} p={4} bg="white" borderRadius="lg" shadow="sm">
        <Heading size="md" mb={2}>Overall Similarity</Heading>
        <Text fontSize="3xl" fontWeight="bold">
          {(comparison.similarity * 100).toFixed(1)}%
        </Text>
        {comparison.flags.suddenImprovements.length > 0 && (
          <Text color="orange.500" mt={2}>
            ⚠️ Significant improvements detected
          </Text>
        )}
      </Box>

      {/* Main Content */}
      {activeTab === 'overview' && (
        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <Box p={4} bg="white" borderRadius="lg" shadow="sm">
            <Heading size="md" mb={4}>Key Differences</Heading>
            <MetricsComparison
              differences={comparison.differences.metrics}
              flags={comparison.flags}
            />
          </Box>
          <Box p={4} bg="white" borderRadius="lg" shadow="sm">
            <Heading size="md" mb={4}>Writing Style</Heading>
            <StyleAnalysis
              differences={comparison.differences.style}
              confidence={comparison.confidence}
            />
          </Box>
        </Grid>
      )}

      {activeTab === 'style' && (
        <Box p={4} bg="white" borderRadius="lg" shadow="sm">
          <Heading size="md" mb={4}>Detailed Style Analysis</Heading>
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            <Box>
              <Heading size="sm" mb={2}>Pattern Changes</Heading>
              <DifferenceHighlighter
                changes={comparison.differences.style.patternChanges}
              />
            </Box>
            <Box>
              <Heading size="sm" mb={2}>Complexity Analysis</Heading>
              <Text>
                Complexity Change: {comparison.differences.style.complexityDelta > 0 ? '+' : ''}
                {comparison.differences.style.complexityDelta.toFixed(2)}
              </Text>
              <Text mt={2}>
                Consistency Score: {(comparison.differences.style.consistencyScore * 100).toFixed(1)}%
              </Text>
            </Box>
          </Grid>
        </Box>
      )}

      {activeTab === 'vocabulary' && (
        <Box p={4} bg="white" borderRadius="lg" shadow="sm">
          <Heading size="md" mb={4}>Vocabulary Analysis</Heading>
          <VocabularyAnalysis
            newWords={comparison.differences.vocabulary.newWords}
            removedWords={comparison.differences.vocabulary.removedWords}
            complexityChange={comparison.differences.vocabulary.complexityChange}
          />
        </Box>
      )}

      {/* Warnings and Flags */}
      {comparison.flags.warnings.length > 0 && (
        <Box mt={6} p={4} bg="orange.50" borderRadius="lg">
          <Heading size="md" mb={2} color="orange.700">Warnings</Heading>
          {comparison.flags.warnings.map((warning, index) => (
            <Text key={index} color="orange.700">• {warning}</Text>
          ))}
        </Box>
      )}
    </Box>
  );
};
