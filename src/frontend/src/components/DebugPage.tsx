'use client';

import React, { useState, useEffect } from 'react';
import { Box, Text, Button } from '@chakra-ui/react';

export default function DebugPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    console.log('Debug Page Mounted');
    setIsLoaded(true);
  }, []);

  return (
    <Box p={4} bg='green.50' border='2px dashed red' w='full'>
      <Text fontSize='xl' mb={4}>Debug Page Content</Text>
      {isLoaded ? (
        <Box p={4} bg='white'>
          <Text>✅ Component loaded successfully</Text>
          <Button mt={4} colorScheme='blue'>Test Button</Button>
        </Box>
      ) : (
        <Text>Loading...</Text>
      )}
    </Box>
  );
}
