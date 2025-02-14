'use client';

import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  IconButton,
  useBreakpointValue,
  Collapse,
  HStack,
  Badge
} from '@chakra-ui/react';
import { FiBell, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  timestamp: string;
}

interface MobileNotificationsProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
}

export const MobileNotifications: React.FC<MobileNotificationsProps> = ({
  notifications,
  onDismiss,
  onClearAll
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });

  if (!isMobile) return null;

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return 'orange';
      case 'success':
        return 'green';
      default:
        return 'blue';
    }
  };

  return (
    <Box position="fixed" top={0} right={0} zIndex={20} p={4}>
      <VStack align="flex-end" spacing={2}>
        <HStack>
          {notifications.length > 0 && (
            <Badge
              colorScheme="red"
              borderRadius="full"
              position="absolute"
              top={0}
              right={0}
              transform="translate(50%, -50%)"
            >
              {notifications.length}
            </Badge>
          )}
          <IconButton
            aria-label="Notifications"
            icon={<FiBell />}
            onClick={() => setIsOpen(!isOpen)}
            variant="ghost"
            size="lg"
          />
        </HStack>

        <Collapse in={isOpen}>
          <VStack
            bg="white"
            shadow="lg"
            borderRadius="md"
            p={4}
            spacing={4}
            align="stretch"
            maxH="80vh"
            overflowY="auto"
            minW="300px"
          >
            <AnimatePresence>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                >
                  <Box
                    p={3}
                    bg={`${getNotificationColor(notification.type)}.50`}
                    borderRadius="md"
                    position="relative"
                  >
                    <IconButton
                      aria-label="Dismiss"
                      icon={<FiX />}
                      size="sm"
                      position="absolute"
                      top={2}
                      right={2}
                      variant="ghost"
                      onClick={() => onDismiss(notification.id)}
                    />
                    <Text fontWeight="bold" mb={1}>
                      {notification.title}
                    </Text>
                    <Text fontSize="sm">{notification.message}</Text>
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      {new Date(notification.timestamp).toLocaleString()}
                    </Text>
                  </Box>
                </motion.div>
              ))}
            </AnimatePresence>

            {notifications.length > 0 && (
              <Text
                color="blue.500"
                fontSize="sm"
                cursor="pointer"
                textAlign="center"
                onClick={onClearAll}
              >
                Clear all notifications
              </Text>
            )}
          </VStack>
        </Collapse>
      </VStack>
    </Box>
  );
}; 