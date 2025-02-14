'use client';

import React from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  useBreakpointValue,
  IconButton
} from '@chakra-ui/react';
import { FiHome, FiBook, FiUser, FiActivity } from 'react-icons/fi';
import { useRouter, usePathname } from 'next/navigation';

export const MobileNavBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useBreakpointValue({ base: true, md: false });

  if (!isMobile) return null;

  const navItems = [
    { icon: FiHome, label: 'Home', path: '/dashboard' },
    { icon: FiBook, label: 'Essays', path: '/essays' },
    { icon: FiActivity, label: 'Analysis', path: '/analysis' },
    { icon: FiUser, label: 'Profile', path: '/profile' }
  ];

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg="white"
      boxShadow="0 -2px 10px rgba(0,0,0,0.05)"
      zIndex={10}
    >
      <HStack justify="space-around" py={2}>
        {navItems.map((item) => (
          <VStack
            key={item.path}
            spacing={1}
            flex={1}
            onClick={() => router.push(item.path)}
            cursor="pointer"
            color={pathname.startsWith(item.path) ? 'blue.500' : 'gray.500'}
          >
            <IconButton
              aria-label={item.label}
              icon={<item.icon />}
              variant="ghost"
              size="sm"
              color="inherit"
            />
            <Text fontSize="xs" fontWeight="medium">
              {item.label}
            </Text>
          </VStack>
        ))}
      </HStack>
    </Box>
  );
}; 