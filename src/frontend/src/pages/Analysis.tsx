import { useState } from 'react';
import { Box, Button, Textarea, Text, useToast } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { analyzeText } from '../api/analysis';

interface AnalysisResult {
  ai_detection: {
    is_ai_generated: boolean;
    confidence_score: number;
  };
}

const Analysis = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const handleAnalyze = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Error',
        description: 'Please login to analyze text',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const analysisResult = await analyzeText(text);
      setResult(analysisResult);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to analyze text',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to analyze..."
        mb={4}
      />
      <Button onClick={handleAnalyze} isLoading={isLoading}>
        Analyze
      </Button>
      {result && (
        <Box mt={4}>
          <Text>AI Detection Score: {result.ai_detection.confidence_score}%</Text>
          <Text>
            Verdict: {result.ai_detection.is_ai_generated ? 'AI Generated' : 'Human Written'}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default Analysis; 