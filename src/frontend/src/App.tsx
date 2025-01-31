import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Analyze from './pages/Analyze';
import History from './pages/History';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App; 