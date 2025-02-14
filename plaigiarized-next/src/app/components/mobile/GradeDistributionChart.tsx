'use client';

import React from 'react';
import { Box, Text, VStack, HStack, Badge } from '@chakra-ui/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface GradeRange {
  range: string;
  count: number;
  percentage: number;
}

interface GradeDistributionProps {
  data: GradeRange[];
  classAverage: number;
  medianGrade: number;
}

export const GradeDistributionChart: React.FC<GradeDistributionProps> = ({
  data,
  classAverage,
  medianGrade
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          bg="white"
          p={2}
          borderRadius="md"
          boxShadow="md"
          border="1px solid"
          borderColor="gray.200"
        >
          <Text fontWeight="bold">{label}</Text>
          <Text>Count: {payload[0].value}</Text>
          <Text>
            {payload[0].payload.percentage.toFixed(1)}% of class
          </Text>
        </Box>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <VStack spacing={4} align="stretch" w="100%">
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="bold">
            Grade Distribution
          </Text>
          <HStack spacing={2}>
            <Badge colorScheme="green">
              Avg: {classAverage}%
            </Badge>
            <Badge colorScheme="blue">
              Median: {medianGrade}%
            </Badge>
          </HStack>
        </HStack>

        <Box h="200px" w="100%">
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <XAxis
                dataKey="range"
                fontSize={12}
                tickMargin={5}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                fill="#4299E1"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </VStack>
    </motion.div>
  );
}; 