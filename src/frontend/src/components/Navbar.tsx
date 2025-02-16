'use client';

import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { MdTextFields } from 'react-icons/md';

export default function Navbar(): ReactNode {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <MdTextFields className="h-6 w-6" />
          <span className="font-bold">plAIgiarized</span>
        </Link>
        <div className="space-x-4">
          <Link to="/analyze" className="hover:text-primary">Analyze</Link>
          <Link to="/history" className="hover:text-primary">History</Link>
        </div>
      </div>
    </nav>
  );
}
