import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface TextStats {
  wordCount: number;
  charCount: number;
  sentenceCount: number;
  paragraphCount: number;
}

export interface AnalysisResult {
  score: number;
  confidence: number;
  textStats?: TextStats;
}

export async function analyzeText(text: string): Promise<AnalysisResult> {
  try {
    const response = await axios.post<AnalysisResult>(`${API_URL}/api/analyze`, { text });
    return response.data;
  } catch (error) {
    throw new Error('Failed to analyze text');
  }
}
