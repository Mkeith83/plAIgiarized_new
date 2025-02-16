import { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Analyze from './pages/Analyze';
import History from './pages/History';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App(): ReactNode {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ChakraProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/analyze" element={<Analyze />} />
                  <Route path="/history" element={<History />} />
                </Routes>
              </main>
            </div>
          </Router>
        </ChakraProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
