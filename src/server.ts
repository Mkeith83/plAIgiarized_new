import express from 'express';
import cors from 'cors';

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

app.post('/api/analyze', async (req, res) => {
  try {
    console.log('Received analysis request:', req.body);
    const { text } = req.body;
    
    if (!text) {
      console.log('No text provided');
      return res.status(400).json({ error: 'No text provided' });
    }
    
    // Mock analysis for development
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

    console.log('Sending analysis result:', mockAnalysis);
    res.json(mockAnalysis);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Failed to analyze text' });
  }
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
}); 