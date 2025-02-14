'use client';

import React from 'react';
import { Box, Text, List, ListItem } from '@chakra-ui/react';

interface DifferenceHighlighterProps {
  changes: string[];
  type?: 'addition' | 'removal' | 'change';
}

export const DifferenceHighlighter: React.FC<DifferenceHighlighterProps> = ({
  changes,
  type = 'change'
}) => {
  const getHighlightColor = (type: string) => {
    switch (type) {
      case 'addition':
        return 'green.100';
      case 'removal':
        return 'red.100';
      default:
        return 'yellow.100';
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'addition':
        return 'green.700';
      case 'removal':
        return 'red.700';
      default:
        return 'yellow.700';
    }
  };

  return (
    <Box>
      <List spacing={2}>
        {changes.map((change, index) => (
          <ListItem
            key={index}
            p={2}
            borderRadius="md"
            bg={getHighlightColor(type)}
            color={getTextColor(type)}
          >
            <Text fontSize="sm">
              {type === 'addition' && '+ '}
              {type === 'removal' && '- '}
              {change}
            </Text>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}; 