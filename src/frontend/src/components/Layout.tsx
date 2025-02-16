import { ReactNode } from 'react';
import Navbar from './Navbar';  // Fixed casing of Navbar import
import { Toaster } from 'sonner';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-xl px-4 py-8">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
