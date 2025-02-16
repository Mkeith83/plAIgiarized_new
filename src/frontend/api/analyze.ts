import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    
    const mockAnalysis = {
      score: Math.floor(Math.random() * 100),
      confidence: Math.floor(Math.random() * 30) + 70,
      textStats: {
        wordCount: text.trim().split(/\s+/).length,
        charCount: text.length,
        sentenceCount: text.split(/[.!?]+/).filter(Boolean).length,
        paragraphCount: text.split(/\n\s*\n/).filter(Boolean).length,
      }
    };

    res.json(mockAnalysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze text' });
  }
} 