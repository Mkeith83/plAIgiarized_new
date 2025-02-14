'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BaselineUpload } from '@/app/components/analysis/BaselineUpload';
import { ComparisonView } from '@/app/components/analysis/ComparisonView';

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState<'baseline' | 'comparison'>('baseline');
  const router = useRouter();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Analysis Tools</h1>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('baseline')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'baseline'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Baseline Management
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'comparison'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Essay Comparison
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'baseline' ? (
          <BaselineUpload onSuccess={(essayId) => {
            router.push(`/analysis/${essayId}`);
          }} />
        ) : (
          <ComparisonView />
        )}
      </div>
    </div>
  );
}
