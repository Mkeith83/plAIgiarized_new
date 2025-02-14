import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const analyzeText = async (text: string) => {
  try {
    console.log('Sending request to:', `${API_URL}/api/analyze`);
    const response = await axios.post(`${API_URL}/api/analyze`, { text });
    console.log('Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Full error:', error);
    console.error('Error response:', error.response?.data);
    throw new Error(error.response?.data?.error || 'Failed to analyze text');
  }
};
