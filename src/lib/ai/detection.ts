interface DetectionResult {
  aiProbability: number,
  stealthAttempt: boolean,
  anomalyScore: number,
  confidenceLevel: number,
  detectionMethod: string
}

const detectAIContent = async (text: string, baseline: BaselineMetrics) => {
  // Local analysis first (no API)
  const localAnalysis = analyzeLocally(text, baseline)
  
  // Only use OpenAI if uncertain
  if (localAnalysis.confidenceLevel < 0.8) {
    return await enhanceWithOpenAI(localAnalysis)
  }
  
  return localAnalysis
} 