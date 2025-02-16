'use client';

import { useState, FormEvent } from 'react';
import { useToast } from '@chakra-ui/react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

interface TextStats {
  wordCount: number;
  charCount: number;
  sentenceCount: number;
  paragraphCount: number;
}

interface AnalysisResult {
  score: number;
  confidence: number;
  textStats?: TextStats;
}

export default function AnalysisForm() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to analyze text',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Text Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to analyze..."
            className="mb-4"
          />
          <Button type="submit" disabled={!text || loading}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </Button>
        </form>
        
        {result && (
          <div className="mt-4">
            <h3>Results:</h3>
            <p>Score: {result.score}%</p>
            <p>Confidence: {result.confidence}%</p>
            {result.textStats && (
              <div>
                <p>Word Count: {result.textStats.wordCount}</p>
                <p>Character Count: {result.textStats.charCount}</p>
                <p>Sentence Count: {result.textStats.sentenceCount}</p>
                <p>Paragraph Count: {result.textStats.paragraphCount}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
