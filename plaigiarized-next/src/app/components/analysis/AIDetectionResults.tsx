'use client';

import { AnalysisResult } from '@/lib/interfaces/database/models';

interface Props {
  analysis: AnalysisResult;
}

export function AIDetectionResults({ analysis }: Props) {
  const getConfidenceColor = (score: number) => {
    if (score > 0.8) return 'text-red-600';
    if (score > 0.4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getConfidenceLabel = (score: number) => {
    if (score > 0.8) return 'High AI Probability';
    if (score > 0.4) return 'Uncertain';
    return 'Likely Human';
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-sm text-gray-600">AI Score</div>
          <div className={`text-xl font-bold ${getConfidenceColor(analysis.aiScore)}`}>
            {(analysis.aiScore * 100).toFixed(1)}%
          </div>
          <div className="text-sm font-medium">
            {getConfidenceLabel(analysis.aiScore)}
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-600">Confidence</div>
          <div className="text-xl font-bold">
            {(analysis.confidence * 100).toFixed(1)}%
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-600">Grade Level</div>
          <div className="text-xl font-bold">
            {analysis.gradeLevel?.toFixed(1) || 'N/A'}
          </div>
        </div>
      </div>

      {analysis.segments && analysis.segments.length > 0 && (
        <div className="mt-6">
          <div className="text-sm font-medium mb-2">Suspicious Segments</div>
          <div className="space-y-2">
            {analysis.segments.map((segment, index) => (
              <div 
                key={index}
                className={`p-2 rounded ${
                  segment.probability > 0.8 ? 'bg-red-50' :
                  segment.probability > 0.4 ? 'bg-yellow-50' :
                  'bg-green-50'
                }`}
              >
                <div className="text-sm">{segment.text}</div>
                <div className="text-xs text-gray-600 mt-1">
                  Confidence: {(segment.probability * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
