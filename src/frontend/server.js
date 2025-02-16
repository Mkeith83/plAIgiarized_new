import express from 'express';
import cors from 'cors';

const app = express();
const port = 3003;

app.use(cors());
app.use(express.json());

app.post('/api/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    console.log('Received request with text:', text);
    
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

    console.log('Sending analysis:', mockAnalysis);
    res.json(mockAnalysis);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Failed to analyze text' });
  }
});

// Add a test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

app.listen(port, 'localhost', () => {
  console.log(`API server running at http://localhost:${port}`);
});

export default app;
