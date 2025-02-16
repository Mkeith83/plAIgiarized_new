'use client';

import React from 'react';
import { Box, Flex, VStack } from '@chakra-ui/react';

export default function DebugLayout({ children }) {
  console.log('Debug Layout Rendering');
  
  return (
    <Flex minH='100vh' direction='column' bg='gray.100'>
      <Box as='header' p={4} bg='blue.500' color='white'>
        plAIgiarized
      </Box>
      
      <VStack flex={1} spacing={4} p={4} bg='red.50'>
        <Box p={4} bg='white' shadow='md' w='full'>
          Debug Info:
          <pre>{JSON.stringify({
            windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'SSR',
            chakraLoaded: true,
            routerPath: typeof window !== 'undefined' ? window.location.pathname : 'SSR'
          }, null, 2)}</pre>
        </Box>
        {children}
      </VStack>
    </Flex>
  );
}
