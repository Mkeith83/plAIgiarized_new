'use client';

import { useRef, useState } from 'react';
import { DocumentScanner } from '@/lib/services/scanner';

interface Props {
  onScanComplete: (text: string) => void;
  onError: (error: string) => void;
}

export default function Scanner({ onScanComplete, onError }: Props) {
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanner = new DocumentScanner();

  const handleCapture = async (file: File) => {
    try {
      setScanning(true);
      const result = await scanner.scanDocument(file);
      onScanComplete(result.text);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <label htmlFor="document-scan" className="sr-only">
        Scan Document
      </label>
      <input
        id="document-scan"
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        aria-label="Document Scanner"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleCapture(file);
        }}
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={scanning}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg
          disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {scanning ? 'Scanning...' : 'Scan Document'}
      </button>

      {scanning && (
        <div className="mt-4 text-center text-gray-600" role="status">
          Processing image, please wait...
        </div>
      )}
    </div>
  );
}
