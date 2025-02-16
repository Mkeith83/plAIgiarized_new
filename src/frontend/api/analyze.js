module.exports = (req, res) => {
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
    res.status(500).json({ error: 'Failed to analyze text' });
  }
}; 