import axios from 'axios';

interface AnalysisResult {
  ai_detection: {
    is_ai_generated: boolean;
    confidence_score: number;
  };
}

export const analyzeText = async (text: string): Promise<AnalysisResult> => {
  try {
    const response = await axios.post('/api/analyze', { text });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 