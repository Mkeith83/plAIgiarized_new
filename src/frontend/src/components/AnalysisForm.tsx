import React, { useState } from 'react';
import { analyzeText } from '../api/analysis';

export default function AnalysisForm() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const analysis = await analyzeText(text);
      setResult(analysis);
    } catch (err) {
      setError('Failed to analyze text. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="text" className="block text-sm font-medium text-gray-700">
            Enter text to analyze
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={6}
            placeholder="Paste your text here..."
          />
        </div>

        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze Text'}
        </button>

        {error && (
          <div className="text-red-600 text-sm mt-2">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900">Analysis Results</h3>
            <dl className="mt-2 space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">AI Score</dt>
                <dd className="text-sm text-gray-900">{result.ai_score.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Complexity</dt>
                <dd className="text-sm text-gray-900">{result.complexityScore.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Consistency</dt>
                <dd className="text-sm text-gray-900">{result.consistencyScore.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Originality</dt>
                <dd className="text-sm text-gray-900">{result.originalityScore.toFixed(2)}</dd>
              </div>
            </dl>
          </div>
        )}
      </form>
    </div>
  );
} 