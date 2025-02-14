'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface TextStats {
  wordCount: number;
  charCount: number;
  sentenceCount: number;
  paragraphCount: number;
}

interface AnalysisResult {
  score: number;
  confidence: number;
  details: string;
  textStats?: TextStats;
}

const getTextStats = (text: string): TextStats => {
  return {
    wordCount: text.trim().split(/\s+/).length,
    charCount: text.length,
    sentenceCount: text.split(/[.!?]+/).filter(Boolean).length,
    paragraphCount: text.split(/\n\s*\n/).filter(Boolean).length,
  };
};

const analyzeContent = async (text: string) => {
  try {
    const response = await fetch('/api/analyze', {  // Simple URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      throw new Error('Analysis failed');
    }
    
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

const saveResult = async (result: AnalysisResult) => {
  try {
    // Properly stringify the result object
    const resultString = JSON.stringify(result);
    localStorage.setItem('lastAnalysis', resultString);
  } catch (error) {
    console.error('Failed to save result:', error);
  }
};

export default function AnalysisForm() {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number) => {
    if (score < 30) return '✓ Likely Human-Written';
    if (score < 70) return '⚠ Possibly AI-Generated';
    return '🤖 Likely AI-Generated';
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Call the API endpoint
      const apiResult = await analyzeContent(text);
      
      // Format the result
      const mockResult: AnalysisResult = {
        score: apiResult.score,
        confidence: apiResult.confidence,
        textStats: apiResult.textStats,
        details: `Analysis Details:
• AI Detection Score: ${apiResult.score}%
• Word Count: ${apiResult.textStats.wordCount}
• Character Count: ${apiResult.textStats.charCount}
• Sentences: ${apiResult.textStats.sentenceCount}
• Paragraphs: ${apiResult.textStats.paragraphCount}
• Analysis Method: GPT Detection
• Confidence Level: High
• Classification: ${getScoreMessage(apiResult.score)}`
      };
      
      await saveResult(mockResult);
      setResult(mockResult);
      toast.success('Analysis Complete');
    } catch (error) {
      toast.error('Failed to analyze text');
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Content Detector</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your text here to analyze..."
          className="min-h-[200px]"
        />
        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
        </Button>
        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md shadow-sm">
            <h3 className="font-medium mb-4 text-lg">Analysis Results</h3>
            <div className="space-y-4">
              <div className="p-3 bg-white rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span>AI Probability:</span>
                  <span className={`font-bold ${getScoreColor(result.score)}`}>
                    {result.score}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${getScoreColor(result.score)}`}
                    style={{ width: `${result.score}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-lg">
                  <span className="text-sm text-gray-600">Word Count</span>
                  <p className="text-lg font-medium">{result.textStats.wordCount}</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <span className="text-sm text-gray-600">Confidence</span>
                  <p className="text-lg font-medium">{result.confidence}%</p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">
                  {result.details}
                </pre>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
