'use client';

import React from 'react';
import {
  Box,
  Container,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
  useDisclosure,
  VStack,
  HStack,
  Text,
  useBreakpointValue
} from '@chakra-ui/react';
import { FiMenu, FiHome, FiBook, FiSettings, FiLogOut } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  title
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const { user, logout } = useAuth();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const menuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/dashboard' },
    { icon: FiBook, label: 'Assignments', path: '/assignments' },
    { icon: FiSettings, label: 'Settings', path: '/settings' }
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
    onClose();
  };

  return (
    <Box minH="100vh">
      {/* Mobile Header */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bg="white"
        boxShadow="sm"
        zIndex={10}
      >
        <Container maxW="container.lg">
          <HStack h="60px" justify="space-between">
            {isMobile && (
              <IconButton
                aria-label="Menu"
                icon={<FiMenu />}
                variant="ghost"
                onClick={onOpen}
              />
            )}
            <Text fontSize="lg" fontWeight="bold">
              {title || 'Plagiarism Detector'}
            </Text>
            <Box w="40px" /> {/* Spacer for alignment */}
          </HStack>
        </Container>
      </Box>

      {/* Mobile Navigation Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            {user?.email}
          </DrawerHeader>

          <DrawerBody>
            <VStack spacing={4} align="stretch">
              {menuItems.map((item) => (
                <HStack
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  cursor="pointer"
                  p={3}
                  borderRadius="md"
                  _hover={{ bg: 'gray.100' }}
                >
                  <item.icon />
                  <Text>{item.label}</Text>
                </HStack>
              ))}

              <HStack
                onClick={handleLogout}
                cursor="pointer"
                p={3}
                borderRadius="md"
                _hover={{ bg: 'gray.100' }}
                color="red.500"
              >
                <FiLogOut />
                <Text>Logout</Text>
              </HStack>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Box pt="60px" pb="80px">
        <Container maxW="container.lg" p={4}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}; 