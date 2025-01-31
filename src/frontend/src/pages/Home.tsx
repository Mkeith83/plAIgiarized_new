import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

const Home = () => {
  return (
    <Box>
      <Heading>Welcome to plAIgiarized</Heading>
      <Text mt={4}>
        Upload your text to detect AI-generated content.
      </Text>
    </Box>
  );
};

export default Home; 