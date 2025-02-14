import React from 'react';
import AnalysisForm from './components/AnalysisForm';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Text Analysis
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Enter your text below to analyze it for AI-generated content.
          </p>
        </div>
        <div className="mt-10">
          <AnalysisForm />
        </div>
      </div>
    </div>
  );
}

export default App; 