'use client';

import React from 'react';
import {
  VStack,
  Box,
  Text,
  Badge,
  Flex,
  Progress,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { FiInfo, FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import { ProgressChart } from '../charts/ProgressChart';

interface Student {
  id: string;
  name: string;
  progress: {
    current: number;
    change: number;
    trend: 'improving' | 'declining' | 'steady';
  };
  metrics: {
    gradeLevel: number;
    submissions: number;
    lastSubmission: string;
  };
  alerts?: Array<{
    type: 'warning' | 'info';
    message: string;
  }>;
}

interface StudentListProps {
  students: Student[];
  onStudentClick?: (studentId: string) => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  onStudentClick
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <FiTrendingUp color="green" />;
      case 'declining':
        return <FiTrendingDown color="red" />;
      default:
        return <FiMinus color="gray" />;
    }
  };

  const handleInfoClick = (student: Student, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStudent(student);
    onOpen();
  };

  return (
    <>
      <VStack spacing={3} align="stretch">
        {students.map((student) => (
          <Box
            key={student.id}
            p={4}
            borderWidth={1}
            borderRadius="md"
            cursor={onStudentClick ? 'pointer' : 'default'}
            onClick={() => onStudentClick?.(student.id)}
            _hover={{ bg: 'gray.50' }}
          >
            <Flex justify="space-between" align="center">
              <Box>
                <Flex align="center" gap={2}>
                  <Text fontWeight="medium">{student.name}</Text>
                  {student.alerts && student.alerts.length > 0 && (
                    <Badge colorScheme="red">{student.alerts.length}</Badge>
                  )}
                </Flex>
                <Text fontSize="sm" color="gray.600">
                  Grade Level: {student.metrics.gradeLevel.toFixed(1)}
                </Text>
              </Box>
              <Flex align="center" gap={4}>
                <Box textAlign="right">
                  <Flex align="center" gap={2}>
                    <Text>Progress</Text>
                    {getTrendIcon(student.progress.trend)}
                  </Flex>
                  <Progress
                    value={student.progress.current}
                    size="sm"
                    width="100px"
                    colorScheme={
                      student.progress.trend === 'improving' ? 'green' :
                      student.progress.trend === 'declining' ? 'red' :
                      'gray'
                    }
                  />
                </Box>
                <IconButton
                  aria-label="Student details"
                  icon={<FiInfo />}
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleInfoClick(student, e)}
                />
              </Flex>
            </Flex>
          </Box>
        ))}
      </VStack>

      {/* Student Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedStudent?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedStudent && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="medium">Progress Overview</Text>
                  <ProgressChart
                    data={[
                      { timestamp: '2023-01', value: 70 },
                      { timestamp: '2023-02', value: 75 },
                      { timestamp: '2023-03', value: selectedStudent.progress.current }
                    ]}
                    height={200}
                  />
                </Box>

                <Box>
                  <Text fontWeight="medium" mb={2}>Recent Activity</Text>
                  <Text fontSize="sm">
                    Last Submission: {new Date(selectedStudent.metrics.lastSubmission).toLocaleDateString()}
                  </Text>
                  <Text fontSize="sm">
                    Total Submissions: {selectedStudent.metrics.submissions}
                  </Text>
                </Box>

                {selectedStudent.alerts && selectedStudent.alerts.length > 0 && (
                  <Box>
                    <Text fontWeight="medium" mb={2}>Alerts</Text>
                    <VStack align="stretch" spacing={2}>
                      {selectedStudent.alerts.map((alert, index) => (
                        <Badge
                          key={index}
                          colorScheme={alert.type === 'warning' ? 'red' : 'blue'}
                          p={2}
                        >
                          {alert.message}
                        </Badge>
                      ))}
                    </VStack>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}; 