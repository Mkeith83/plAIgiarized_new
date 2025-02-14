'use client';

import React, { useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue
} from '@chakra-ui/react';
import { WritingMetrics, MetricsComparison } from '@/lib/interfaces/metrics';
import { DetectionResults } from './DetectionResults';
import { PatternHeatmap } from '../visualization/PatternHeatmap';

interface ComparisonViewProps {
  currentDocument: {
    id: string;
    content: string;
    metrics: WritingMetrics;
  };
  baselineDocuments: Array<{
    id: string;
    content: string;
    metrics: WritingMetrics;
  }>;
  comparison: MetricsComparison;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  currentDocument,
  baselineDocuments,
  comparison
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const [selectedBaseline, setSelectedBaseline] = React.useState(
    baselineDocuments[0]?.id
  );

  const selectedBaselineDoc = useMemo(
    () => baselineDocuments.find(doc => doc.id === selectedBaseline),
    [baselineDocuments, selectedBaseline]
  );

  const patternData = useMemo(() => {
    if (!selectedBaselineDoc) return [];

    return comparison.differences.style.patterns.changed.map(pattern => ({
      pattern: `${pattern.from} → ${pattern.to}`,
      frequency: 1,
      significance: pattern.significance
    }));
  }, [comparison, selectedBaselineDoc]);

  return (
    <VStack spacing={6} w="100%" align="stretch">
      {/* Document Selection */}
      <Box p={4} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
        <HStack spacing={4}>
          <Text fontWeight="medium">Compare with:</Text>
          <Select
            value={selectedBaseline}
            onChange={e => setSelectedBaseline(e.target.value)}
            maxW="400px"
            aria-label="Select baseline document"
          >
            {baselineDocuments.map(doc => (
              <option key={doc.id} value={doc.id}>
                Document from {doc.metrics.timestamp.toLocaleDateString()}
              </option>
            ))}
          </Select>
        </HStack>
      </Box>

      {/* Main Comparison */}
      <Tabs isLazy>
        <TabList>
          <Tab>Analysis</Tab>
          <Tab>Side by Side</Tab>
          <Tab>Patterns</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <DetectionResults
              metrics={currentDocument.metrics}
              comparison={comparison}
              baseline={selectedBaselineDoc?.metrics}
            />
          </TabPanel>

          <TabPanel>
            <HStack spacing={4} align="start">
              <Box flex={1} p={4} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
                <Text fontWeight="medium" mb={2}>
                  Current Document
                </Text>
                <Box
                  maxH="600px"
                  overflowY="auto"
                  whiteSpace="pre-wrap"
                  fontSize="sm"
                >
                  {currentDocument.content}
                </Box>
              </Box>
              <Box flex={1} p={4} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
                <Text fontWeight="medium" mb={2}>
                  Baseline Document
                </Text>
                <Box
                  maxH="600px"
                  overflowY="auto"
                  whiteSpace="pre-wrap"
                  fontSize="sm"
                >
                  {selectedBaselineDoc?.content}
                </Box>
              </Box>
            </HStack>
          </TabPanel>

          <TabPanel>
            <Box p={4} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
              <Text fontWeight="medium" mb={4}>
                Pattern Changes Heatmap
              </Text>
              <PatternHeatmap
                data={patternData}
                maxColumns={4}
              />
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
}; 