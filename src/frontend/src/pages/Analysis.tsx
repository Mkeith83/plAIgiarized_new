import { ReactNode, useState } from 'react';
import { Box, Button, Textarea, Text, useToast } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { analyzeText, AnalysisResult } from '../api/analysis';

export default function Analysis(): ReactNode {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [text, setText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalysis = async () => {
    if (!text.trim()) return;

    setLoading(true);
    try {
      const analysisResult = await analyzeText(text);
      setResult(analysisResult as AnalysisResult);
      
      toast({
        title: 'Analysis Complete',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to analyze text',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
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
      <Button 
        onClick={handleAnalysis}
        isLoading={loading}
        isDisabled={!text.trim() || !isAuthenticated}
      >
        Analyze
      </Button>

      {result && (
        <Box mt={4}>
          <Text>Score: {result.score}%</Text>
          <Text>Confidence: {result.confidence}%</Text>
          {result.textStats && (
            <>
              <Text>Words: {result.textStats.wordCount}</Text>
              <Text>Characters: {result.textStats.charCount}</Text>
            </>
          )}
        </Box>
      )}
    </Box>
  );
} 