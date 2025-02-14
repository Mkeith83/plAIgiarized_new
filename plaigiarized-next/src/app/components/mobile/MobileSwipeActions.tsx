'use client';

import React, { useState } from 'react';
import {
  Box,
  HStack,
  IconButton,
  Text,
  useBreakpointValue
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2, FiShare2 } from 'react-icons/fi';
import { motion, PanInfo } from 'framer-motion';

interface SwipeAction {
  icon: React.ElementType;
  label: string;
  color: string;
  onClick: () => void;
}

interface MobileSwipeActionsProps {
  children: React.ReactNode;
  actions: SwipeAction[];
}

export const MobileSwipeActions: React.FC<MobileSwipeActionsProps> = ({
  children,
  actions
}) => {
  const [offset, setOffset] = useState(0);
  const isMobile = useBreakpointValue({ base: true, md: false });

  if (!isMobile) return <>{children}</>;

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (Math.abs(info.offset.x) > threshold) {
      setOffset(info.offset.x > 0 ? 200 : -200);
    } else {
      setOffset(0);
    }
  };

  return (
    <Box position="relative" overflow="hidden">
      <HStack
        position="absolute"
        right={0}
        top={0}
        bottom={0}
        bg="gray.100"
        spacing={0}
      >
        {actions.map((action, index) => (
          <IconButton
            key={index}
            aria-label={action.label}
            icon={<action.icon />}
            colorScheme={action.color}
            variant="ghost"
            height="100%"
            onClick={action.onClick}
          />
        ))}
      </HStack>

      <motion.div
        drag="x"
        dragConstraints={{ left: -200, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={{ x: offset }}
        style={{ cursor: 'grab' }}
      >
        {children}
      </motion.div>
    </Box>
  );
}; 