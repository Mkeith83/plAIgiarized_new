'use client';

import { Link } from 'react-router-dom';
import { MdTextFields } from 'react-icons/md';  // Changed to a known icon

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link 
          to="/" 
          className="flex items-center gap-2 font-bold text-primary"
        >
          <MdTextFields className="h-6 w-6" />
          plAIgiarized
        </Link>
        <div className="flex items-center space-x-4">
          <Link 
            to="/analyze" 
            className="text-sm font-medium text-muted-foreground hover:text-primary"
          >
            Analyze
          </Link>
          <Link 
            to="/about" 
            className="text-sm font-medium text-muted-foreground hover:text-primary"
          >
            About
          </Link>
        </div>
      </div>
    </nav>
  );
}
