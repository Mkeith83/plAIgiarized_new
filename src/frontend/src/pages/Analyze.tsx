import { ReactNode } from 'react';
import { Box, Heading } from '@chakra-ui/react';
import AnalysisForm from '../components/AnalysisForm';

export default function Analyze(): ReactNode {
  return (
    <Box>
      <Heading>Text Analysis</Heading>
      <AnalysisForm />
    </Box>
  );
} 