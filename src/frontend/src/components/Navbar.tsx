import React from 'react';
import { Box, Flex, Button, Heading, Spacer } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <Box bg="white" px={4} shadow="sm">
      <Flex h={16} alignItems="center" maxW="container.xl" mx="auto">
        <Heading size="md" color="blue.600">
          plAIgiarized
        </Heading>
        <Spacer />
        <Flex gap={4}>
          <Button as={Link} to="/" variant="ghost">
            Home
          </Button>
          <Button as={Link} to="/analyze" variant="ghost">
            Analyze
          </Button>
          <Button as={Link} to="/history" variant="ghost">
            History
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar; 