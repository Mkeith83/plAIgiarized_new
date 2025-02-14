'use client';

import React, { useEffect, useState } from 'react';
import { Box, Grid, Heading, Text, Flex, Spinner } from '@chakra-ui/react';
import { ClassProgress } from '@/lib/interfaces/analysis/progressInterface';
import { ClassMetrics } from '@/lib/interfaces/metrics';
import { ProgressChart } from '../charts/ProgressChart';
import { MetricsCard } from '../cards/MetricsCard';
import { StudentList } from '../lists/StudentList';
import { AlertsList } from '../lists/AlertsList';

interface TeacherDashboardProps {
  teacherId: string;
  classId?: string;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ 
  teacherId,
  classId 
}) => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<ClassProgress | null>(null);
  const [metrics, setMetrics] = useState<ClassMetrics | null>(null);
  const [alerts, setAlerts] = useState<Array<{
    type: 'warning' | 'info' | 'success';
    message: string;
    studentId?: string;
  }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch class progress
        const progressData = await fetch(
          `/api/teacher/${teacherId}/progress${classId ? `?classId=${classId}` : ''}`
        ).then(res => res.json());
        
        // Fetch class metrics
        const metricsData = await fetch(
          `/api/teacher/${teacherId}/metrics${classId ? `?classId=${classId}` : ''}`
        ).then(res => res.json());
        
        // Fetch alerts
        const alertsData = await fetch(
          `/api/teacher/${teacherId}/alerts${classId ? `?classId=${classId}` : ''}`
        ).then(res => res.json());

        setProgress(progressData);
        setMetrics(metricsData);
        setAlerts(alertsData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teacherId, classId]);

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box p={6}>
      <Heading mb={6}>Teacher Dashboard</Heading>
      
      {/* Overview Cards */}
      <Grid templateColumns="repeat(4, 1fr)" gap={6} mb={8}>
        <MetricsCard
          title="Average Grade Level"
          value={metrics?.averageGradeLevel.toFixed(1) ?? 'N/A'}
          trend={progress?.overall.averageImprovement ?? 0}
        />
        <MetricsCard
          title="Active Students"
          value={metrics?.activeStudents.toString() ?? 'N/A'}
          trend={0}
        />
        <MetricsCard
          title="Submission Rate"
          value={`${(metrics?.submissionRate ?? 0) * 100}%`}
          trend={0}
        />
        <MetricsCard
          title="Improvement Rate"
          value={`${(metrics?.improvementRate ?? 0) * 100}%`}
          trend={progress?.overall.averageImprovement ?? 0}
        />
      </Grid>

      {/* Progress Charts */}
      <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={8}>
        <Box p={4} borderRadius="lg" bg="white" shadow="sm">
          <Heading size="md" mb={4}>Class Progress</Heading>
          <ProgressChart data={progress?.timeline ?? []} />
        </Box>
        <Box p={4} borderRadius="lg" bg="white" shadow="sm">
          <Heading size="md" mb={4}>Grade Level Distribution</Heading>
          {/* Add grade level distribution chart */}
        </Box>
      </Grid>

      {/* Student List and Alerts */}
      <Grid templateColumns="2fr 1fr" gap={6}>
        <Box p={4} borderRadius="lg" bg="white" shadow="sm">
          <Heading size="md" mb={4}>Students</Heading>
          <StudentList 
            students={progress?.students ?? { improved: 0, steady: 0, declining: 0 }}
          />
        </Box>
        <Box p={4} borderRadius="lg" bg="white" shadow="sm">
          <Heading size="md" mb={4}>Alerts</Heading>
          <AlertsList alerts={alerts} />
        </Box>
      </Grid>
    </Box>
  );
};
