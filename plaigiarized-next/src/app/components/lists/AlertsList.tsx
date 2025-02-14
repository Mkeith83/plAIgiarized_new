'use client';

import React from 'react';
import {
  VStack,
  Box,
  Text,
  Badge,
  Flex,
  IconButton,
  Collapse,
  useDisclosure
} from '@chakra-ui/react';
import { FiAlertTriangle, FiInfo, FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface Alert {
  id?: string;
  type: 'warning' | 'info' | 'success';
  message: string;
  timestamp?: string;
  studentId?: string;
  details?: string;
}

interface AlertsListProps {
  alerts: Alert[];
  onAlertClick?: (alertId: string) => void;
  showTimestamp?: boolean;
}

export const AlertsList: React.FC<AlertsListProps> = ({
  alerts,
  onAlertClick,
  showTimestamp = true
}) => {
  const [expandedAlerts, setExpandedAlerts] = React.useState<Set<string>>(new Set());

  const toggleAlert = (alertId: string) => {
    setExpandedAlerts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(alertId)) {
        newSet.delete(alertId);
      } else {
        newSet.add(alertId);
      }
      return newSet;
    });
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return <FiAlertTriangle color="red" />;
      case 'info':
        return <FiInfo color="blue" />;
      case 'success':
        return <FiInfo color="green" />;
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return 'red';
      case 'info':
        return 'blue';
      case 'success':
        return 'green';
    }
  };

  return (
    <VStack spacing={3} align="stretch">
      {alerts.map((alert) => (
        <Box
          key={alert.id || alert.message}
          p={4}
          borderWidth={1}
          borderRadius="md"
          borderColor={`${getAlertColor(alert.type)}.200`}
          bg={`${getAlertColor(alert.type)}.50`}
          cursor={onAlertClick ? 'pointer' : 'default'}
          onClick={() => alert.id && onAlertClick?.(alert.id)}
        >
          <Flex justify="space-between" align="flex-start">
            <Flex gap={3} flex={1}>
              <Box pt={1}>
                {getAlertIcon(alert.type)}
              </Box>
              <Box>
                <Text fontWeight="medium">{alert.message}</Text>
                {showTimestamp && alert.timestamp && (
                  <Text fontSize="sm" color="gray.600">
                    {new Date(alert.timestamp).toLocaleString()}
                  </Text>
                )}
                {alert.studentId && (
                  <Text fontSize="sm" color="gray.600">
                    Student ID: {alert.studentId}
                  </Text>
                )}
                {alert.details && (
                  <Collapse in={expandedAlerts.has(alert.id || alert.message)}>
                    <Text fontSize="sm" mt={2} color="gray.700">
                      {alert.details}
                    </Text>
                  </Collapse>
                )}
              </Box>
            </Flex>
            {alert.details && (
              <IconButton
                aria-label="Toggle details"
                icon={expandedAlerts.has(alert.id || alert.message) ? 
                  <FiChevronUp /> : 
                  <FiChevronDown />
                }
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAlert(alert.id || alert.message);
                }}
              />
            )}
          </Flex>
        </Box>
      ))}
      {alerts.length === 0 && (
        <Box p={4} textAlign="center" color="gray.500">
          <Text>No alerts to display</Text>
        </Box>
      )}
    </VStack>
  );
}; 