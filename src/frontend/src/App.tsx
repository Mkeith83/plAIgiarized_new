import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AnalysisForm from './components/AnalysisForm';
import { Toaster } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';

function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          plAIgiarized
        </h1>
        <p className="mt-2 text-gray-600">
          Detect AI-generated content with precision
        </p>
      </div>
      <div className="max-w-2xl mx-auto">
        <AnalysisForm />
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analyze" element={<AnalysisForm />} />
          </Routes>
        </Layout>
        <Toaster position="top-center" />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
