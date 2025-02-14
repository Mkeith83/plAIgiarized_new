'use client';

import React, { useEffect, useState } from 'react';
import { Box, Grid, Heading, Text, Flex, Spinner } from '@chakra-ui/react';
import { StudentProgress } from '@/lib/interfaces/analysis/progressInterface';
import { ProgressChart } from '../charts/ProgressChart';
import { MetricsCard } from '../cards/MetricsCard';
import { EssayList } from '../lists/EssayList';
import { FeedbackList } from '../lists/FeedbackList';

interface StudentDashboardProps {
  studentId: string;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ 
  studentId 
}) => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [recentEssays, setRecentEssays] = useState<Array<{
    id: string;
    title: string;
    date: string;
    score: number;
    feedback: string[];
  }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch student progress
        const progressData = await fetch(
          `/api/student/${studentId}/progress`
        ).then(res => res.json());
        
        // Fetch recent essays
        const essaysData = await fetch(
          `/api/student/${studentId}/essays?limit=5`
        ).then(res => res.json());

        setProgress(progressData);
        setRecentEssays(essaysData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box p={6}>
      <Heading mb={6}>Student Dashboard</Heading>
      
      {/* Progress Overview */}
      <Grid templateColumns="repeat(3, 1fr)" gap={6} mb={8}>
        <MetricsCard
          title="Grade Level"
          value={progress?.current.gradeLevel.toFixed(1) ?? 'N/A'}
          trend={progress?.improvements.overall.gradeLevelChange ?? 0}
        />
        <MetricsCard
          title="Vocabulary Growth"
          value={`${(progress?.improvements.vocabulary.growth ?? 0) * 100}%`}
          trend={progress?.improvements.vocabulary.complexityIncrease ?? 0}
        />
        <MetricsCard
          title="Writing Style"
          value={`${(progress?.improvements.style.improvement ?? 0) * 100}%`}
          trend={progress?.improvements.style.consistencyChange ?? 0}
        />
      </Grid>

      {/* Progress Charts */}
      <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={8}>
        <Box p={4} borderRadius="lg" bg="white" shadow="sm">
          <Heading size="md" mb={4}>Progress Over Time</Heading>
          <ProgressChart data={progress?.timeline ?? []} />
        </Box>
        <Box p={4} borderRadius="lg" bg="white" shadow="sm">
          <Heading size="md" mb={4}>Skills Breakdown</Heading>
          {/* Add skills radar chart */}
        </Box>
      </Grid>

      {/* Recent Essays and Feedback */}
      <Grid templateColumns="2fr 1fr" gap={6}>
        <Box p={4} borderRadius="lg" bg="white" shadow="sm">
          <Heading size="md" mb={4}>Recent Essays</Heading>
          <EssayList essays={recentEssays} />
        </Box>
        <Box p={4} borderRadius="lg" bg="white" shadow="sm">
          <Heading size="md" mb={4}>Latest Feedback</Heading>
          <FeedbackList 
            feedback={progress?.flags ?? []}
            improvements={progress?.improvements ?? {
              vocabulary: { newWords: [] },
              style: { newPatterns: [] }
            }}
          />
        </Box>
      </Grid>
    </Box>
  );
};
