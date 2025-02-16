'use client';

import React, { useState, useEffect } from 'react';
import { Box, Text, Button, VStack, Code } from '@chakra-ui/react';

export default function DebugComponent() {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setMounted(true);
    try {
      console.log('ChakraUI Components:', Box ? 'Loaded' : 'Not Loaded');
      console.log('Window Location:', window.location.pathname);
      console.log('Component Mounted');
    } catch (err) {
      setError(err);
      console.error('Debug Error:', err);
    }
  }, []);

  return (
    <VStack spacing={4} p={5} border='1px solid red'>
      <Text>Debug Component</Text>
      <Text>Mounted: {mounted ? 'Yes' : 'No'}</Text>
      {error && <Code color='red.500'>Error: {error.message}</Code>}
      <Button onClick={() => console.log('Button clicked')}>Test Button</Button>
    </VStack>
  );
}
