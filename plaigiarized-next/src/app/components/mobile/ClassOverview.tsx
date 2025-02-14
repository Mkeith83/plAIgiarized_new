'use client';

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  IconButton,
  Badge,
  SimpleGrid,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton
} from '@chakra-ui/react';
import { FiUsers, FiAlertCircle, FiTrendingUp, FiMoreVertical } from 'react-icons/fi';

interface ClassStats {
  totalStudents: number;
  activeStudents: number;
  averageScore: number;
  pendingSubmissions: number;
  recentAlerts: number;
}

interface ClassOverviewProps {
  className: string;
  stats: ClassStats;
  onViewDetails: () => void;
}

export const ClassOverview: React.FC<ClassOverviewProps> = ({
  className,
  stats,
  onViewDetails
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const statCards = [
    {
      icon: FiUsers,
      label: 'Active Students',
      value: `${stats.activeStudents}/${stats.totalStudents}`,
      color: 'blue'
    },
    {
      icon: FiTrendingUp,
      label: 'Average Score',
      value: `${stats.averageScore}%`,
      color: 'green'
    },
    {
      icon: FiAlertCircle,
      label: 'Pending',
      value: stats.pendingSubmissions,
      color: 'orange'
    }
  ];

  return (
    <Box bg="white" p={4} borderRadius="lg" shadow="sm">
      <HStack justify="space-between" mb={4}>
        <VStack align="start" spacing={1}>
          <Text fontSize="lg" fontWeight="bold">{className}</Text>
          <Badge colorScheme="blue">Active</Badge>
        </VStack>
        <IconButton
          aria-label="More options"
          icon={<FiMoreVertical />}
          variant="ghost"
          onClick={onOpen}
        />
      </HStack>

      <SimpleGrid columns={3} spacing={4} mb={4}>
        {statCards.map((stat, index) => (
          <VStack
            key={index}
            p={3}
            bg={`${stat.color}.50`}
            borderRadius="md"
            spacing={1}
          >
            <stat.icon color={`${stat.color}.500`} size={20} />
            <Text fontSize="lg" fontWeight="bold">
              {stat.value}
            </Text>
            <Text fontSize="xs" color="gray.600">
              {stat.label}
            </Text>
          </VStack>
        ))}
      </SimpleGrid>

      <VStack align="stretch" spacing={2}>
        <Text fontSize="sm" color="gray.600">Class Progress</Text>
        <Progress
          value={(stats.activeStudents / stats.totalStudents) * 100}
          colorScheme="blue"
          borderRadius="full"
        />
      </VStack>

      <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent borderTopRadius="lg">
          <DrawerCloseButton />
          <DrawerHeader>Class Actions</DrawerHeader>
          <DrawerBody>
            {/* Add quick actions here */}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}; 