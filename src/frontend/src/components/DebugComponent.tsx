'use client';

import { useState, useEffect } from 'react';
import { Box, Text, Button, VStack, Code } from '@chakra-ui/react';

interface DebugData {
  message: string;
  timestamp: string;
}

export default function DebugComponent() {
  const [data, setData] = useState<DebugData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fetchDebugData = async () => {
    try {
      const response = await fetch('/api/debug');
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Button onClick={fetchDebugData}>Fetch Debug Data</Button>
      {error && <Code colorScheme="red">Error: {error.message}</Code>}
      {data && (
        <Box>
          <Text>Message: {data.message}</Text>
          <Text>Timestamp: {data.timestamp}</Text>
        </Box>
      )}
    </VStack>
  );
}
