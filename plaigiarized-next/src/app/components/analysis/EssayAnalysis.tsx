'use client';

import { useState, useEffect } from 'react';
import { AIDetector } from '@/lib/ai/detector';
import { DatabaseService } from '@/lib/services/database';
import { Essay, AnalysisResult } from '@/lib/interfaces/database/models';
import { AIDetectionResults } from './AIDetectionResults';
import { MetricsDisplay } from '../dashboard/MetricsDisplay';

interface Props {
  essayId: string;
}

export function EssayAnalysis({ essayId }: Props) {
  const [essay, setEssay] = useState<Essay | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEssayAndAnalysis = async () => {
      try {
        const db = new DatabaseService();
        const essayData = await db.getEssay(essayId);
        if (!essayData) throw new Error('Essay not found');
        setEssay(essayData);

        const detector = new AIDetector();
        const analysisResult = await detector.analyzeEssay(essayData);
        setAnalysis(analysisResult);
      } catch (error) {
        console.error('Failed to load essay analysis:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEssayAndAnalysis();
  }, [essayId]);

  if (loading) return <div>Loading...</div>;
  if (!essay || !analysis) return <div>Essay not found</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Essay Analysis</h1>

      {/* AI Detection Results */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">AI Detection</h2>
        <AIDetectionResults analysis={analysis} />
      </section>

      {/* Metrics Overview */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Writing Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Vocabulary</h3>
            <MetricsDisplay
              metrics={analysis.metrics.vocabulary}
              type="percentage"
            />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-3">Style</h3>
            <MetricsDisplay
              metrics={analysis.metrics.style}
              type="percentage"
            />
          </div>
        </div>
      </section>

      {/* Essay Content */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Essay Content</h2>
        <div className="bg-white rounded-lg shadow p-4">
          <pre className="whitespace-pre-wrap font-sans">
            {essay.content}
          </pre>
        </div>
      </section>
    </div>
  );
} 