'use client';

import React, { useState, useEffect } from 'react';
import { Box, Text, Button } from '@chakra-ui/react';

export default function DebugPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Add your debug data fetching logic here
      const response = await fetch('/api/debug');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Debug fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Text>Debug Information</Text>
      <Button onClick={fetchData} isLoading={loading}>
        Refresh Debug Data
      </Button>
      {data && (
        <Box mt={4}>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </Box>
      )}
    </Box>
  );
}
