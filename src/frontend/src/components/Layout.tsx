import React from 'react';
import { Box, Container, Flex, Heading } from '@chakra-ui/react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Container maxW="container.xl" py={8}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout; 